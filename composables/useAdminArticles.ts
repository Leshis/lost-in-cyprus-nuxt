import { ref, onMounted } from 'vue'
import { processEnum } from '@/utils/articleHelpers'
import type { Article } from '~/types/database.types'

export function useAdminArticles() {
    const supabase = useSupabaseClient()
    const articles = ref<Article[]>([])
    const categories = ref<string[]>([])
    const districts = ref<string[]>([])

    const fetchArticles = async (): Promise<void> => {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Failed to fetch articles:', error.message)
            return
        }
        articles.value = (data as unknown as Article[]) ?? []
    }

    const fetchEnums = async (): Promise<void> => {
        // Add <any, any> to the rpc call
        const { data: catData, error: catError } = await (supabase.rpc as any)('get_enum_values', {
            type_name: 'category_type',
        })

        if (catError) {
            console.error('Failed to fetch categories:', catError.message)
        } else if (catData) {
            categories.value = processEnum(catData, ['hiking', 'food', 'culture', 'wine'])
        }

        // Repeat for districts
        const { data: distData, error: distError } = await (supabase.rpc as any)('get_enum_values', {
            type_name: 'district',
        })

        if (distError) {
            console.error('Failed to fetch districts:', distError.message)
        } else if (distData) {
            districts.value = processEnum(distData, [
                'limassol', 'paphos', 'nicosia', 'larnaca', 'kyrenia', 'famagusta',
            ])
        }
    }

    onMounted(() => {
        fetchArticles()
        fetchEnums()
    })

    return { articles, categories, districts, fetchArticles }
}