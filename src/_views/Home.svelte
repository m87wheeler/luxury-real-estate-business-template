<script>
  import Block from '../_atoms/Block.svelte';
  import Card from '../_atoms/Card.svelte';
  import MapFrame from '../_atoms/MapFrame.svelte';
  import ParallaxImage from '../_atoms/ParallaxImage.svelte';
  import Title from '../_atoms/Title.svelte';
  import ContactCard from '../_molecules/ContactCard.svelte';
  import ContactDetails from '../_molecules/ContactDetails.svelte';
  import SearchPanel from '../_molecules/SearchPanel.svelte';
  import DatePicker from '../_organisms/DatePicker.svelte';
</script>

<style type="text/scss">
</style>

<ParallaxImage src="/images/roberto-nickson-rEJxpBskj3Q-unsplash.jpg">
  Welcome to the luxury of home
</ParallaxImage>
<Block height="16rem" style="top: -1rem;" primary />
<Block height="20rem">
  <Card
    style="position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;">
    <Title
      type="h5"
      style="position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%); width: calc(100% - 2rem); padding: 1rem;">
      "Eu irure tempor magna cupidatat deserunt duis ullamco cillum nisi laborum
      proident cillum laboris."
    </Title>
  </Card>
</Block>
<Block primary style="padding: 3rem 1rem; z-index: 5;">
  <Title type="h4">START YOUR JOURNEY</Title>
  <SearchPanel optionOne="Buy" optionTwo="Rent" />
</Block>
<ParallaxImage src="/images/stephen-packwood-05NwbYV2t_g-unsplash.jpg" />
<Block height="20rem">
  <Card
    style="position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); padding: 1rem; text-align: center; z-index: 10;">
    <ContactCard />
  </Card>
</Block>
<Block height="60rem">
  <Card
    low
    style="margin: 0 1rem; width: calc(100% - 2rem); border-bottom-right-radius: .75rem; border-bottom-left-radius: .75rem;">
    <DatePicker />
  </Card>
</Block>
<ParallaxImage src="/images/nastuh-abootalebi-yWwob8kwOCk-unsplash.jpg" />
<Block height="23rem" primary>
  <Card
    style="position: absolute; top: -4rem; left: 1rem; width: calc(100% - 2rem); height: 25rem; z-index: 10;">
    <MapFrame />
  </Card>
</Block>
<Block primary style="margin-top: -1px; padding-bottom: 4rem;">
  <Title type="h4">VISIT OR CONTACT US</Title>
  <div style="margin-bottom: 3rem; text-align: center;">
    <p>237 - 238 Gilbert St</p>
    <p>Mayfair</p>
    <p>London</p>
    <p>W1K 4AH</p>
  </div>
  <ContactDetails
    title="Sales"
    tel="0208 521 7938"
    email="sales@opulentproperties.com" />
  <ContactDetails
    title="Lettings"
    tel="0208 521 7940"
    email="lettings@opulentproperties.com" />
</Block>
