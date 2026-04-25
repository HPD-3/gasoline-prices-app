<script setup>
import { ref, computed } from 'vue'
import FuelPriceTable from './FuelPriceTable.vue'

const fuelData = ref([])
const loading = ref(false)
const error = ref(null)
const lastUpdated = ref(null)

const averagePrice = computed(() => {
  if (!fuelData.value.length) return 0
  const pertalitePrices = fuelData.value.filter(item => item.pertalite).map(item => item.pertalite)
  if (pertalitePrices.length === 0) return 0
  const sum = pertalitePrices.reduce((acc, price) => acc + price, 0)
  return (sum / pertalitePrices.length).toLocaleString('id-ID')
})

const cheapest = computed(() => {
  if (!fuelData.value.length) return null
  return fuelData.value.reduce((min, item) =>
    (item.pertalite || Infinity) < (min.pertalite || Infinity) ? item : min
  )
})

const mostExpensive = computed(() => {
  if (!fuelData.value.length) return null
  return fuelData.value.reduce((max, item) =>
    (item.pertalite || 0) > (max.pertalite || 0) ? item : max
  )
})

async function scrapeFuelPrices() {
  loading.value = true
  error.value = null
  
  try {
    // Call the API endpoint (works both locally and on Vercel)
    const response = await fetch('/api/fuel')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data && result.data.length > 0) {
      fuelData.value = result.data
      lastUpdated.value = new Date().toLocaleString()
    } else {
      throw new Error('No data received from API')
    }
  } catch (err) {
    error.value = `Failed to fetch fuel data: ${err.message}`
    console.error('API error:', err.message)
  } finally {
    loading.value = false
  }
}

function clearData() {
  fuelData.value = []
  lastUpdated.value = null
  error.value = null
}

function toggleDataSource() {
  scrapeFuelPrices()
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="header">
      <h1>⛽ Indonesian Fuel Price Dashboard</h1>
      <p class="subtitle">Real-time BBM prices by province</p>
    </header>

    <!-- Controls -->
    <section class="controls">
      <div class="button-group">
        <button
          @click="scrapeFuelPrices"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? '🔄 Scraping...' : '🔄 Update Prices' }}
        </button>
        
        <button
          @click="clearData"
          :disabled="!fuelData.length"
          class="btn btn-secondary"
        >
          🗑️ Clear
        </button>
      </div>

      <div v-if="lastUpdated" class="timestamp">
        Last updated: {{ lastUpdated }}
      </div>
    </section>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-error">
      ⚠️ {{ error }}
    </div>

    <!-- Stats Cards -->
    <section v-if="fuelData.length" class="stats">
      <div class="stat-card">
        <div class="stat-label">Total Provinces</div>
        <div class="stat-value">{{ fuelData.length }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Avg Pertalite</div>
        <div class="stat-value">Rp {{ averagePrice }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Cheapest</div>
        <div class="stat-value">{{ cheapest?.location }}</div>
        <div class="stat-subtext">Rp {{ cheapest?.pertalite?.toLocaleString('id-ID') }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Most Expensive</div>
        <div class="stat-value">{{ mostExpensive?.location }}</div>
        <div class="stat-subtext">Rp {{ mostExpensive?.pertalite?.toLocaleString('id-ID') }}</div>
      </div>
    </section>

    <!-- Data Table -->
    <FuelPriceTable
      v-if="fuelData.length"
      :data="fuelData"
      :loading="loading"
    />

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">⛽</div>
      <h2>No Data Yet</h2>
      <p>Click "Update Prices" to load Indonesian fuel price data</p>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

.toggle-label input {
  cursor: pointer;
}

.timestamp {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #fee;
  color: #c00;
  border-left: 4px solid #c00;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.stat-subtext {
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #999;
  margin: 0;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .button-group {
    width: 100%;
  }

  .btn {
    flex: 1;
  }
}
</style>
