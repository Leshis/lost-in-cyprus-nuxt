import { defineStore } from 'pinia'

interface MapState {
  selectedDistrict: string | null
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    selectedDistrict: null,
  }),
  
  actions: {
    setSelectedDistrict(districtId: string | null) {
      this.selectedDistrict = districtId
    }
  }
})