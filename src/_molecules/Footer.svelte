<script>
  import BackToTop from '../_atoms/BackToTop.svelte';
  import Card from '../_atoms/Card.svelte';
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  footer {
    position: relative;
    width: 100%;
    height: auto;
    padding: 4rem 1rem 3rem;
    display: flex;
    flex-flow: column nowrap;
    background: $primary;
    text-align: center;

    p,
    a {
      font-size: 0.75rem;
      margin: 0;
      padding: 0.5rem 0;
      color: $black;
      text-decoration: none;
    }
  }
</style>

<footer>
  <Card
    style="position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);">
    <BackToTop on:scrollToTop />
  </Card>
  <p>2020 Opulent Properties</p>
  <p>
    <a href="https://martinwheelerweb.com">&copy; 2020 Martin Wheeler Web</a>
  </p>
</footer>
