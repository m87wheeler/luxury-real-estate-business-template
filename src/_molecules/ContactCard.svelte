<script>
</script>

<style type="text/scss">
  @import '../__base/theme.scss';

  .wrapper {
    display: flex;
    flex-flow: column nowrap;
    padding: 0 1.5rem;

    a {
      color: $black;
      text-decoration: none;

      &:first-of-type {
        margin-bottom: 1rem;
      }

      img {
        height: 3rem;
        opacity: 0.6;
        margin: 0 auto;
      }

      p {
        font-style: italic;
        margin: 0.5rem auto 1rem;
      }
    }
  }
</style>

<div class="wrapper">
  <a href="/">
    <img src="images/speech-bubbles-chat-symbol.png" alt="chat symbol" />
    <p>Speak with one of our dedicated specialists today.</p>
  </a>
  <a href="/">
    <img src="images/appointment-book.png" alt="appointment symbol" />
    <p>Make an appointment with us at your earliest convenience.</p>
  </a>
</div>
