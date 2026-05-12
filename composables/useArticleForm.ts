import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import type { Article } from '~/types/database.types'

export type ArticleFormFields = Omit<Article, 'id' | 'created_at'>

const EMPTY_FORM: ArticleFormFields = {
    title: '',
    slug: '',
    alt_text: '',
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
    const resetTimerId = ref<ReturnType<typeof setTimeout> | null>(null)
    const statusTimerId = ref<ReturnType<typeof setTimeout> | null>(null)

    const resetForm = () => {
        if (resetTimerId.value) clearTimeout(resetTimerId.value)
        if (statusTimerId.value) clearTimeout(statusTimerId.value)
        editingId.value = null
        selectedFile.value = null
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

    const MAX_FILE_SIZE_MB = 10
    const MAX_DIMENSION = 1200

    const handleFileChange = async (event: Event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            selectedFile.value = null
            statusMsg.value = `Image must be under ${MAX_FILE_SIZE_MB}MB.`
            isError.value = true
            target.value = ''
            return
        }

        const bitmap = await createImageBitmap(file)

        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
        const width = Math.round(bitmap.width * scale)
        const height = Math.round(bitmap.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
        bitmap.close()

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

            if (statusTimerId.value) clearTimeout(statusTimerId.value)
            statusTimerId.value = setTimeout(() => {
                statusMsg.value = ''
                isError.value = false
            }, 3000)
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

            if (publish && (selectedFile.value || form.image_url) && !form.alt_text) {
                throw new Error('Please provide and image description (Alt Text) for SEO')
            }
            
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
                alt_text: form.alt_text,
                slug: form.slug,
                district: form.district,
                content: form.content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<h2>$1</h2>'),
                category: form.category,
                lat: form.lat,
                long: form.long,
                scheduled_from: form.scheduled_from || null,
                scheduled_to: form.scheduled_to || null,
                affiliate_url: form.affiliate_url,
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
                if (publish && !imagePath) throw new Error('Please select an image.')
                const { error } = await (supabase.from('articles') as any)
                    .insert([{ ...articlePayload, image_url: imagePath }])

                if (error) throw error
                statusMsg.value = publish ? 'Article published!' : 'Draft saved!'
            }

            await onSuccess()
            if (!editingId.value) {
                if (resetTimerId.value) clearTimeout(resetTimerId.value)
                resetTimerId.value = setTimeout(() => { resetForm() }, 1500)
            } else {
                // On edit: clear status message only, keep the form populated
                if (statusTimerId.value) clearTimeout(statusTimerId.value)
                statusTimerId.value = setTimeout(() => { statusMsg.value = ''; isError.value = false }, 3000)
            }

        } catch (err) {
            isError.value = true
            statusMsg.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
        } finally {
            uploading.value = false
        }
    }

    onBeforeUnmount(() => {
        if (resetTimerId.value) clearTimeout(resetTimerId.value)
        if (statusTimerId.value) clearTimeout(statusTimerId.value)
    })

    return {
        form, isSlugCustom, uploading, statusMsg, isError,
        editingId, selectedFile,
        resetForm, handleEdit, handleFileChange,
        handleFormError, uploadArticle, handleTogglePublish,
    }
}
