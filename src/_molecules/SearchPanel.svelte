<script>
  import { Search } from '../__stores/SearchStore.js';

  import Button from '../_atoms/Button.svelte';
  import Card from '../_atoms/Card.svelte';
  import Input from '../_atoms/Input.svelte';
  import Switch from '../_atoms/Switch.svelte';

  export let optionOne;
  export let optionTwo;
  $: buy = true;

  const switchInput = e => (e.detail ? (buy = false) : (buy = true));
  const valueInput = e => ($Search[e.detail[0]] = e.detail[1]);
  $: $Search.buy = buy;
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .panel {
    display: grid;
    grid-template-rows: auto 1fr 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
    row-gap: 2rem;
    justify-items: center;
    align-items: center;
    padding: 1rem 0;

    p {
      margin: 0.5rem 0;
    }
  }
</style>

<div class="panel">
  <Switch
    {optionOne}
    {optionTwo}
    style="grid-column: 1 / 3;"
    on:switchInput={switchInput} />
  <div style="grid-column: 1 / 3; width: 100%;">
    <p>Area, street or postcode</p>
    <Card>
      <Input
        placeholder="Knighsbridge, SW7, Gloucester Road"
        name="area"
        on:inputUpdate={valueInput} />
    </Card>
  </div>
  <div style="grid-column: 1 / 2;">
    <p>Min (£)</p>
    <Card>
      <Input
        type="number"
        placeholder={buy ? '650,000' : '3,500 pcm'}
        name="min"
        on:inputUpdate={valueInput} />
    </Card>
  </div>
  <div style="grid-column: 2 / 3;">
    <p>Max (£)</p>
    <Card>
      <Input
        type="number"
        placeholder={buy ? '13,000,000' : '10,000 pcm'}
        name="max"
        on:inputUpdate={valueInput} />
    </Card>
  </div>
  <Card style="grid-column: 1 / 3;">
    <Button primary link="/properties">Search</Button>
  </Card>
</div>
