<script lang="ts">
export default {
  name: "ProductViewToggle",
  props: {
    viewMode: {
      type: String,
      default: 'grid'
    }
  },
  emits: ['toggleView'],
  setup(props, { emit }) {
    // Funkcija za promenu prikaza (grid/list)
    const toggleView = () => {
      const newViewMode = props.viewMode === 'grid' ? 'list' : 'grid';
      emit('toggleView', newViewMode);
    };

    return {
      toggleView
    };
  }
}
</script>