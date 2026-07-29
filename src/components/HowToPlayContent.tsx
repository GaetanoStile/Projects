export default function HowToPlayContent() {
  return (
    <div className="space-y-8 text-left">
      <h2 className="text-3xl md:text-4xl font-display gold-text text-center">
        How To Play
      </h2>

      <section className="space-y-3">
        <h3 className="text-xl font-display text-gold">1. Setup</h3>
        <ul className="list-disc list-inside space-y-2 text-gold/80 font-body text-sm md:text-base leading-relaxed">
          <li>Enter both player names in Settings.</li>
          <li>Decide which cards are enabled in the Card Manager.</li>
          <li>
            One player will be the <strong className="text-gold">"Caller"</strong>{' '}
            (blindfolded) and the other is the{' '}
            <strong className="text-gold">"Performer"</strong>.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-display text-gold">2. Decide Who Goes First</h3>
        <ul className="list-disc list-inside space-y-2 text-gold/80 font-body text-sm md:text-base leading-relaxed">
          <li>Roll the dice to decide who starts.</li>
          <li>The starting player becomes the first active turn in the game.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-display text-gold">3. Each Turn</h3>
        <ul className="list-disc list-inside space-y-2 text-gold/80 font-body text-sm md:text-base leading-relaxed">
          <li>Only the current player's decks (A–D) are shown.</li>
          <li>
            The blindfolded Caller chooses a deck by calling out{' '}
            <strong className="text-gold">"A"</strong>,{' '}
            <strong className="text-gold">"B"</strong>,{' '}
            <strong className="text-gold">"C"</strong>, or{' '}
            <strong className="text-gold">"D"</strong>.
          </li>
          <li>The Performer draws from the called deck and follows the card.</li>
          <li>When ready for a new card, the Caller calls another letter.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-display text-gold">
          4. Swap Cards &amp; the Black Deck
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gold/80 font-body text-sm md:text-base leading-relaxed">
          <li>Swap cards are hidden in the letter decks.</li>
          <li>
            If you draw a Swap Card, you can:
            <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
              <li>Save it for later, or</li>
              <li>Use it to swap roles (Caller ↔ Performer).</li>
            </ul>
          </li>
          <li>
            When you hold <strong className="text-gold">2 or more Swap Cards</strong>, the{' '}
            <strong className="text-gold">Black deck</strong> becomes available.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-display text-gold">5. Ending the Game</h3>
        <ul className="list-disc list-inside space-y-2 text-gold/80 font-body text-sm md:text-base leading-relaxed">
          <li>You can end anytime, or when decks are exhausted.</li>
          <li>
            Use the in-game controls to remove or disable cards for the session if
            needed.
          </li>
        </ul>
      </section>
    </div>
  )
}
