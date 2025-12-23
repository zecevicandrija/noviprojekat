// src/app/components/Uplate/Uplate.js
'use client';

import { useState } from 'react';
import { FaPaypal, FaBitcoin, FaUniversity, FaCopy, FaCheckCircle, FaArrowRight, FaLock } from 'react-icons/fa';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import styles from './Uplate.module.css';

export default function Uplate() {
  const [selectedMethod, setSelectedMethod] = useState('paypal');
  const [amount, setAmount] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bankovski podaci
  const bankInfo = {
    ime: "Vladimir Trifunović",
    banka: "Banka Intesa",
    racun: "160510010143223060",
    swift: "swift",
    pozivNaBroj: "1234"
  };

  // Crypto adrese
  const cryptoAddresses = {
    bitcoin: "",
    ethereum: ""
  };

  // Copy to clipboard funkcija
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // PayPal integracija
  const handlePayPalPayment = () => {
    if (!amount || amount <= 0) {
      alert('Molimo unesite iznos donacije');
      return;
    }
    
    setIsProcessing(true);
    
    // PayPal webhook - zameni sa tvojim PayPal client ID
    const paypalUrl = `https://www.paypal.com/donate/?hosted_button_id=TVOJ_BUTTON_ID&amount=${amount}&currency_code=EUR`;
    window.open(paypalUrl, '_blank');
    
    setTimeout(() => setIsProcessing(false), 1000);
  };

  return (
    <section className={styles.uplateSection}>
      {/* Dekorativna linija iznad */}
      <div className={styles.sectionDivider}>
        <div className={styles.dividerLine}></div>
        <div className={styles.dividerIcon}>💳</div>
        <div className={styles.dividerLine}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Podrži <span className={styles.highlight}>Dijalog</span> Podcast</h2>
          <p className={styles.subtitle}>
            Izaberi način uplate koji ti najviše odgovara. Svaka donacija pomaže!
          </p>
        </div>

        <div className={styles.content}>
          
          {/* Payment Method Selector */}
          <div className={styles.methodSelector}>
            <button
              className={`${styles.methodBtn} ${selectedMethod === 'paypal' ? styles.active : ''}`}
              onClick={() => setSelectedMethod('paypal')}
            >
              <FaPaypal className={styles.methodIcon} />
              <span>PayPal</span>
            </button>

            <button
              className={`${styles.methodBtn} ${selectedMethod === 'crypto' ? styles.active : ''}`}
              onClick={() => setSelectedMethod('crypto')}
            >
              <FaBitcoin className={styles.methodIcon} />
              <span>Crypto</span>
            </button>

            <button
              className={`${styles.methodBtn} ${selectedMethod === 'bank' ? styles.active : ''}`}
              onClick={() => setSelectedMethod('bank')}
            >
              <FaUniversity className={styles.methodIcon} />
              <span>Banka</span>
            </button>
          </div>

          {/* Payment Content */}
          <div className={styles.paymentContent}>
            
            {/* PAYPAL */}
            {selectedMethod === 'paypal' && (
              <div className={styles.paymentCard}>
                <div className={styles.cardHeader}>
                  <FaPaypal className={styles.cardIcon} />
                  <h3>PayPal Donacija</h3>
                </div>

                <p className={styles.cardDescription}>
                  Brza i sigurna uplata putem PayPal-a. Podržava kartice i PayPal račun.
                </p>

                <div className={styles.amountInput}>
                  <label htmlFor="amount">Iznos (EUR)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>€</span>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10.00"
                      min="1"
                    />
                  </div>
                </div>

                <div className={styles.quickAmounts}>
                  <span className={styles.quickLabel}>Brzi izbor:</span>
                  <button onClick={() => setAmount('5')} className={styles.quickBtn}>€5</button>
                  <button onClick={() => setAmount('10')} className={styles.quickBtn}>€10</button>
                  <button onClick={() => setAmount('20')} className={styles.quickBtn}>€20</button>
                  <button onClick={() => setAmount('50')} className={styles.quickBtn}>€50</button>
                </div>

                <button
                  className={styles.payBtn}
                  onClick={handlePayPalPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Obrađujem...'
                  ) : (
                    <>
                      <FaPaypal /> Doniraj putem PayPal-a <FaArrowRight />
                    </>
                  )}
                </button>

                <div className={styles.securityBadge}>
                  <FaLock /> Sigurna transakcija sa PayPal zaštitom
                </div>
              </div>
            )}

            {/* CRYPTO */}
            {selectedMethod === 'crypto' && (
              <div className={styles.paymentCard}>
                <div className={styles.cardHeader}>
                  <FaBitcoin className={styles.cardIcon} />
                  <h3>Crypto Donacija</h3>
                </div>

                <p className={styles.cardDescription}>
                  Pošalji Bitcoin ili Ethereum direktno na naše wallet adrese.
                </p>

                {/* Bitcoin */}
                <div className={styles.cryptoOption}>
                  <div className={styles.cryptoHeader}>
                    <SiBitcoin className={styles.cryptoIcon} style={{color: '#F7931A'}} />
                    <span className={styles.cryptoName}>Bitcoin (BTC)</span>
                  </div>
                  <div className={styles.addressBox}>
                    <code className={styles.address}>{cryptoAddresses.bitcoin}</code>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(cryptoAddresses.bitcoin, 'bitcoin')}
                    >
                      {copiedField === 'bitcoin' ? (
                        <><FaCheckCircle /> Kopirano!</>
                      ) : (
                        <><FaCopy /> Kopiraj</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ethereum */}
                <div className={styles.cryptoOption}>
                  <div className={styles.cryptoHeader}>
                    <SiEthereum className={styles.cryptoIcon} style={{color: '#627EEA'}} />
                    <span className={styles.cryptoName}>Ethereum (ETH)</span>
                  </div>
                  <div className={styles.addressBox}>
                    <code className={styles.address}>{cryptoAddresses.ethereum}</code>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(cryptoAddresses.ethereum, 'ethereum')}
                    >
                      {copiedField === 'ethereum' ? (
                        <><FaCheckCircle /> Kopirano!</>
                      ) : (
                        <><FaCopy /> Kopiraj</>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.cryptoNote}>
                  <strong>Napomena:</strong> Pošalji samo BTC na Bitcoin adresu i ETH na Ethereum adresu. 
                  Slanje drugih kriptovaluta može rezultirati trajnim gubitkom sredstava.
                </div>
              </div>
            )}

            {/* BANK */}
            {selectedMethod === 'bank' && (
              <div className={styles.paymentCard}>
                <div className={styles.cardHeader}>
                  <FaUniversity className={styles.cardIcon} />
                  <h3>Bankovna Uplata</h3>
                </div>

                <p className={styles.cardDescription}>
                  Izvrši uplatu direktno na naš račun.
                </p>

                <div className={styles.bankDetails}>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Primalac:</span>
                    <div className={styles.bankValue}>
                      <span>{bankInfo.ime}</span>
                      <button
                        className={styles.copyBtnSmall}
                        onClick={() => copyToClipboard(bankInfo.ime, 'ime')}
                      >
                        {copiedField === 'ime' ? <FaCheckCircle /> : <FaCopy />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Banka:</span>
                    <div className={styles.bankValue}>
                      <span>{bankInfo.banka}</span>
                      <button
                        className={styles.copyBtnSmall}
                        onClick={() => copyToClipboard(bankInfo.banka, 'banka')}
                      >
                        {copiedField === 'banka' ? <FaCheckCircle /> : <FaCopy />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Račun:</span>
                    <div className={styles.bankValue}>
                      <code>{bankInfo.racun}</code>
                      <button
                        className={styles.copyBtnSmall}
                        onClick={() => copyToClipboard(bankInfo.racun, 'racun')}
                      >
                        {copiedField === 'racun' ? <FaCheckCircle /> : <FaCopy />}
                      </button>
                    </div>
                  </div>

                  {/* <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>SWIFT:</span>
                    <div className={styles.bankValue}>
                      <code>{bankInfo.swift}</code>
                      <button
                        className={styles.copyBtnSmall}
                        onClick={() => copyToClipboard(bankInfo.swift, 'swift')}
                      >
                        {copiedField === 'swift' ? <FaCheckCircle /> : <FaCopy />}
                      </button>
                    </div>
                  </div> */}

                  {/* <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Poziv na broj:</span>
                    <div className={styles.bankValue}>
                      <code>{bankInfo.pozivNaBroj}</code>
                      <button
                        className={styles.copyBtnSmall}
                        onClick={() => copyToClipboard(bankInfo.pozivNaBroj, 'poziv')}
                      >
                        {copiedField === 'poziv' ? <FaCheckCircle /> : <FaCopy />}
                      </button>
                    </div>
                  </div> */}
                </div>

                {/* <div className={styles.bankNote}>
                  💡 <strong>Savet:</strong> Prilikom uplate navedi "Donacija za Dijalog Podcast" 
                  kao svrhu plaćanja kako bismo mogli da identifikujemo tvoju uplatu.
                </div> */}
              </div>
            )}

          </div>

          {/* Benefits Reminder */}
          <div className={styles.benefitsReminder}>
            <h4>🎁 Zašto donirati?</h4>
            <ul>
              <li>✨ Pristup premium sadržaju</li>
              <li>🎬 Rani pristup novim epizodama</li>
              <li>🎙️ Bonus materijali</li>
              <li>❤️ Podrška nezavisnom novinarstvu</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Dekorativna linija ispod */}
      <div className={styles.sectionDivider}>
        <div className={styles.dividerLine}></div>
        <div className={styles.dividerIcon}>❤️</div>
        <div className={styles.dividerLine}></div>
      </div>
    </section>
  );
}