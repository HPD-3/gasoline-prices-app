<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const sortedData = computed(() => {
  return [...props.data].sort((a, b) => {
    const priceA = a.pertalite || 0;
    const priceB = b.pertalite || 0;
    return priceB - priceA;
  })
})
</script>

<template>
  <section class="table-container">
    <div class="table-header">
      <h2>Indonesian Fuel Prices by Province</h2>
      <p class="table-info">{{ data.length }} provinces • Prices in IDR (Indonesian Rupiah)</p>
    </div>

    <div class="table-wrapper">
      <table class="fuel-table">
        <thead>
          <tr>
            <th class="location">Provinsi</th>
            <th class="pertalite">Pertalite</th>
            <th class="pertamax">Pertamax</th>
            <th class="pertamax-turbo">Pertamax Turbo</th>
            <th class="green">Green 95</th>
            <th class="biosolar">Biosolar</th>
            <th class="dexlite">Dexlite</th>
            <th class="dex">Dex</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in sortedData" :key="item.location">
            <td class="location"><strong>{{ item.location }}</strong></td>
            <td class="pertalite" :class="getPriceClass(item.pertalite)">{{ formatPrice(item.pertalite) }}</td>
            <td class="pertamax" :class="getPriceClass(item.pertamax)">{{ formatPrice(item.pertamax) }}</td>
            <td class="pertamax-turbo" :class="getPriceClass(item.pertamax_turbo)">{{ formatPrice(item.pertamax_turbo) }}</td>
            <td class="green" :class="getPriceClass(item.pertamax_green_95)">{{ formatPrice(item.pertamax_green_95) }}</td>
            <td class="biosolar" :class="getPriceClass(item.biosolar_subsidi)">{{ formatPrice(item.biosolar_subsidi) }}</td>
            <td class="dexlite" :class="getPriceClass(item.dexlite)">{{ formatPrice(item.dexlite) }}</td>
            <td class="dex" :class="getPriceClass(item.pertamina_dex)">{{ formatPrice(item.pertamina_dex) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  methods: {
    getPriceClass(price) {
      if (!price) return 'empty';
      if (price > 20000) return 'expensive'
      if (price > 12000) return 'moderate'
      return 'cheap'
    },
    formatPrice(price) {
      if (!price) return '-'
      return `Rp ${price.toLocaleString('id-ID')}`
    },
  },
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.table-header h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.table-info {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
}

.table-wrapper {
  overflow-x: auto;
}

.fuel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.fuel-table thead {
  background: #f9f9f9;
  border-bottom: 2px solid #e0e0e0;
}

.fuel-table th {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.fuel-table th.location {
  text-align: left;
}

.fuel-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.fuel-table td.location {
  text-align: left;
  font-weight: 600;
  color: #333;
  min-width: 150px;
}

.fuel-table tbody tr {
  transition: background-color 0.2s ease;
}

.fuel-table tbody tr:hover {
  background-color: #f9f9f9;
}

.fuel-table td.cheap {
  color: #10b981;
}

.fuel-table td.moderate {
  color: #f59e0b;
}

.fuel-table td.expensive {
  color: #ef4444;
}

.fuel-table td.empty {
  color: #ccc;
}

@media (max-width: 768px) {
  .fuel-table {
    font-size: 0.85rem;
  }

  .fuel-table th,
  .fuel-table td {
    padding: 0.5rem 0.25rem;
  }

  .table-header {
    padding: 1rem;
  }

  .table-header h2 {
    font-size: 1.2rem;
  }
}
</style>
