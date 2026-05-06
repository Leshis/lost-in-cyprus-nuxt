import { defineStore } from 'pinia'

interface MapState {
  selectedDistrict: string | null
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    selectedDistrict: null,
  }),
  
  actions: {
    // 3. Define the parameter type
    setSelectedDistrict(districtId: string | null) {
      this.selectedDistrict = districtId
    }
  }
})