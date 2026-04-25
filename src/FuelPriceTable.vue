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
  return [...props.data].sort((a, b) => b.price_per_liter - a.price_per_liter)
})
</script>

<template>
  <section class="table-container">
    <div class="table-header">
      <h2>Fuel Prices by Country</h2>
      <p class="table-info">{{ data.length }} countries • Sorted by price (highest first)</p>
    </div>

    <div class="table-wrapper">
      <table class="fuel-table">
        <thead>
          <tr>
            <th class="rank">Rank</th>
            <th class="country">Country</th>
            <th class="price">Price/Liter</th>
            <th class="currency">Currency</th>
            <th class="updated">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in sortedData" :key="item.country" :class="getPriceClass(item.price_per_liter)">
            <td class="rank">{{ index + 1 }}</td>
            <td class="country">{{ item.country }}</td>
            <td class="price"><strong>${{ item.price_per_liter.toFixed(2) }}</strong></td>
            <td class="currency">{{ item.currency }}</td>
            <td class="updated">{{ formatDate(item.updated_at) }}</td>
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
      if (price > 1.50) return 'expensive'
      if (price > 1.00) return 'moderate'
      return 'cheap'
    },
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        return dateString
      }
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
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.fuel-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.fuel-table tbody tr {
  transition: background-color 0.2s ease;
}

.fuel-table tbody tr:hover {
  background-color: #f9f9f9;
}

.fuel-table tr.cheap {
  --accent-color: #10b981;
}

.fuel-table tr.moderate {
  --accent-color: #f59e0b;
}

.fuel-table tr.expensive {
  --accent-color: #ef4444;
}

.fuel-table .rank {
  color: #999;
  width: 60px;
  text-align: center;
  font-weight: 500;
}

.fuel-table .country {
  font-weight: 600;
  color: #333;
  width: 20%;
}

.fuel-table .price {
  color: var(--accent-color, #667eea);
  font-size: 1.1rem;
  width: 15%;
}

.fuel-table .currency {
  color: #666;
  width: 12%;
}

.fuel-table .updated {
  color: #999;
  font-size: 0.85rem;
  width: 25%;
}

@media (max-width: 768px) {
  .fuel-table {
    font-size: 0.85rem;
  }

  .fuel-table th,
  .fuel-table td {
    padding: 0.75rem;
  }

  .table-header {
    padding: 1rem;
  }

  .table-header h2 {
    font-size: 1.2rem;
  }
}
</style>
