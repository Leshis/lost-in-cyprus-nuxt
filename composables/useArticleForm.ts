import { ref, reactive, watch } from 'vue'
import type { Article } from '~/types/database.types'

export type ArticleFormFields = Omit<Article, 'id' | 'created_at'>

const EMPTY_FORM: ArticleFormFields = {
    title: '',
    slug: '',
    district: '',
    content: '',
    category: '',
    lat: null,
    long: null,
    scheduled_from: null,
    scheduled_to: null,
    is_published: false,
    affiliate_url: null,
    image_url: null
}

export function useArticleForm(onSuccess: () => Promise<void>) {
    const supabase = useSupabaseClient()
    const form = reactive<ArticleFormFields>({ ...EMPTY_FORM })
    const uploading = ref(false)
    const statusMsg = ref('')
    const isError = ref(false)
    const selectedFile = ref<File | null>(null)
    const editingId = ref<number | null>(null)
    const isSlugCustom = ref(false)

    const resetForm = () => {
        editingId.value = null
        isSlugCustom.value = false
        Object.assign(form, EMPTY_FORM)
        if (statusMsg) statusMsg.value = ''
    }

    watch(() => form.title, (newTitle) => {
        if (!editingId.value && !isSlugCustom.value) {
            form.slug = newTitle
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
        }
    })

    const formatForInput = (dateString: string | null | undefined) => {
        if (!dateString) return null
        return dateString.slice(0, 16)
    }

    const handleEdit = (article: Article) => {
        resetForm()

        let extractedLat = article.lat
        let extractedLong = article.long

        if (!extractedLat && article.location) {
            const coords = article.location.match(/-?\d+\.\d+/g)
            if (coords && coords.length >= 2) {
                const [lng, lat] = coords
                extractedLong = parseFloat(lng!)
                extractedLat = parseFloat(lat!)
            }
        }

        Object.assign(form, {
            ...article,
            lat: extractedLat ?? null,
            long: extractedLong ?? null,
            scheduled_from: formatForInput(article.scheduled_from),
            scheduled_to: formatForInput(article.scheduled_to),
        })

        editingId.value = article.id
        isSlugCustom.value = true
        statusMsg.value = ''
        isError.value = false
    }

    const handleFileChange = async (event: Event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        const bitmap = await createImageBitmap(file)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0)

        const webpBlob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob(resolve, 'image/webp', 0.85)
        )

        if (webpBlob) {
            selectedFile.value = new File(
                [webpBlob],
                file.name.replace(/\.[^.]+$/, '.webp'),
                { type: 'image/webp' }
            )
        }
    }

    const handleTogglePublish = async (): Promise<void> => {
        if (!editingId.value) return
        const newPublishState = !form.is_published

        try {
            uploading.value = true
            statusMsg.value = newPublishState ? 'Publishing...' : 'Unpublishing...'
            isError.value = false

            const { error } = await (supabase.from('articles') as any)
                .update({ is_published: newPublishState })
                .eq('id', editingId.value)

            if (error) throw error
            form.is_published = newPublishState
            statusMsg.value = newPublishState ? 'Article published.' : 'Article unpublished.'

            await onSuccess()
            setTimeout(() => resetForm(), 1500)
        } catch (err) {
            isError.value = true
            statusMsg.value = err instanceof Error
                ? err.message
                : `Failed to ${newPublishState ? 'publish' : 'unpublish'}.`
        } finally {
            uploading.value = false
        }
    }

    const handleFormError = (message: string) => {
        isError.value = true
        statusMsg.value = message
    }

    const uploadArticle = async (publish: boolean = true) => {
        try {
            uploading.value = true
            statusMsg.value = 'Saving...'
            isError.value = false

            const oldImagePath = editingId.value ? form.image_url : null

            let imagePath: string | undefined
            if (selectedFile.value) {
                const ext = selectedFile.value.name.split('.').pop()
                const fileName = `${crypto.randomUUID()}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('articles')
                    .upload(fileName, selectedFile.value)

                if (uploadError) throw uploadError
                imagePath = fileName
            }

            const articlePayload = {
                title: form.title,
                slug: form.slug,
                district: form.district,
                content: form.content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<h2>$1</h2>'),
                category: form.category,
                lat: form.lat,
                long: form.long,
                scheduled_from: form.scheduled_from || null,
                scheduled_to: form.scheduled_to || null,
                is_published: publish,
            }

            if (editingId.value) {
                const { error } = await (supabase.from('articles') as any)
                    .update({
                        ...articlePayload,
                        ...(imagePath && { image_url: imagePath }),
                    })
                    .eq('id', editingId.value)

                if (error) throw error

                if (imagePath && oldImagePath) {
                    supabase.storage
                        .from('articles')
                        .remove([oldImagePath])
                        .then(({ error: delError }: { error: Error | null }) => {
                            if (delError) console.warn('Failed to clean up old image:', delError)
                        })
                }

                statusMsg.value = publish ? 'Article published!' : 'Draft saved!'
            } else {
                if (!imagePath) throw new Error('Please select an image.')
                const { error } = await (supabase.from('articles') as any)
                    .insert([{ ...articlePayload, image_url: imagePath }])

                if (error) throw error
                statusMsg.value = publish ? 'Article published!' : 'Draft saved!'
            }

            await onSuccess()
            setTimeout(() => { resetForm() }, 1500)

        } catch (err) {
            isError.value = true
            statusMsg.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
        } finally {
            uploading.value = false
        }
    }

    return {
        form, isSlugCustom, uploading, statusMsg, isError,
        editingId, selectedFile,
        resetForm, handleEdit, handleFileChange,
        handleFormError, uploadArticle, handleTogglePublish,
    }
}