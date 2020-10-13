<script>
  import Title from '../_atoms/Title.svelte';
  export let title;
  export let tel;
  export let email;
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    width: 100%;
    height: auto;
    padding: 0 1rem 1rem;
    text-align: center;

    a {
      text-decoration: none;
      color: $black;
      line-height: 1.5em;
    }
  }
</style>

<div class="wrapper">
  <Title type="h6">{title}</Title>
  <a href={`tel: ${tel}`}>{tel}</a>
  <a href={`email: ${email}`}>{email}</a>
</div>
