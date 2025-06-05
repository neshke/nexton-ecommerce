<?php
require_once __DIR__ . '/../vendor/autoload.php'; 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP; // Dodato za SMTP::DEBUG_SERVER

/**
 * Šalje email potvrdu korisniku nakon uspešnog kreiranja porudžbine.
 *
 * @param string $userEmail Email adresa korisnika.
 * @param string $userName Ime korisnika.
 * @param mixed $orderId ID porudžbine.
 * @param float $totalAmount Ukupan iznos porudžbine.
 * @param array $orderDetails Opciono, niz sa detaljima stavki porudžbine. Svaka stavka treba da bude niz sa 'name', 'quantity', 'price'.
 * @return bool True ako je email uspešno poslat, false u suprotnom.
 */
function sendOrderConfirmationEmail($userEmail, $userName, $orderId, $totalAmount, $orderDetails = []) {
    $mail = new PHPMailer(true);

    try {
        // Podešavanja servera
        // -------------------------------------------------------------------------------------
        // SMTP DEBUGGING:
        // SMTP::DEBUG_OFF (0) = isključeno (koristiti u produkciji)
        // SMTP::DEBUG_CLIENT (1) = prikazuje poruke koje šalje klijent
        // SMTP::DEBUG_SERVER (2) = prikazuje poruke koje šalje klijent i server (korisno za debug)
        // SMTP::DEBUG_CONNECTION (3) = kao 2, plus informacije o inicijalnoj konekciji
        // SMTP::DEBUG_LOWLEVEL (4) = prikazuje sve niske nivoe komunikacije
        $mail->SMTPDebug = 0; 

        // Kaže PHPMailer-u da koristi SMTP protokol
        $mail->isSMTP();

        // SMTP Host za Gmail
        $mail->Host       = 'smtp.gmail.com';

        // SMTP Autentifikacija: Da li SMTP server zahteva korisničko ime i lozinku?
        // Skoro uvek je true.
        $mail->SMTPAuth   = true;

        // Tvoja Gmail adresa
        $mail->Username   = 'anesic9@gmail.com';

        // TVOJA GMAIL LOZINKA ili APP PASSWORD
        // VAŽNO: Ako koristiš 2-FAKTORSKU AUTENTIFIKACIJU na Gmailu,
        // MORAŠ generisati "App Password" na svom Google nalogu i uneti je ovde.
        // Tvoja regularna Gmail lozinka NEĆE raditi sa 2FA.
        // Ako ne koristiš 2FA, unesi svoju regularnu Gmail lozinku,
        // ali možda ćeš morati da omogućiš "Less secure app access" na Google nalogu.
        $mail->Password   = '#Alexasd098';

        // Enkripcija i port za Gmail
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        // Alternativno, možeš probati SMTPS (SSL) ako STARTTLS ne radi:
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        // $mail->Port       = 465;

        $mail->CharSet = 'UTF-8';

        // Primaoci
        // Postavi "From" email na tvoju Gmail adresu ili drugu adresu koju Gmail dozvoljava da šalješ kao
        $mail->setFrom('anesic9@gmail.com', 'Naziv Vaše Prodavnice'); // Prilagodi "Naziv Vaše Prodavnice"
        // Email adresa i ime primaoca (korisnik koji je napravio porudžbinu)
        $mail->addAddress($userEmail, $userName);

        // Sadržaj
        $mail->isHTML(true); // Postavi email format na HTML
        $mail->Subject = 'Potvrda porudžbine #' . htmlspecialchars($orderId);
        
        $emailBody = "<h1>Hvala na porudžbini!</h1>";
        $emailBody .= "<p>Poštovani/a " . htmlspecialchars($userName) . ",</p>";
        $emailBody .= "<p>Vaša porudžbina broj <strong>#" . htmlspecialchars($orderId) . "</strong> je uspešno primljena.</p>";
        $emailBody .= "<p>Ukupan iznos: <strong>" . htmlspecialchars(number_format($totalAmount, 2, ',', '.')) . " €</strong></p>";
        
        if (!empty($orderDetails) && is_array($orderDetails)) {
            $emailBody .= "<h2>Detalji porudžbine:</h2><ul>";
            foreach ($orderDetails as $item) {
                // Pretpostavka: $item je niz sa ključevima 'name', 'quantity', 'price'
                $itemName = isset($item['name']) ? $item['name'] : 'Nepoznata stavka';
                $itemQuantity = isset($item['quantity']) ? $item['quantity'] : 'N/A';
                $itemPrice = isset($item['price']) ? number_format($item['price'], 2, ',', '.') : 'N/A';
                $emailBody .= "<li>" . htmlspecialchars($itemName) . " - Količina: " . htmlspecialchars($itemQuantity) . " - Cena: " . htmlspecialchars($itemPrice) . " €</li>";
            }
            $emailBody .= "</ul>";
        }
        
        $emailBody .= "<p>Uskoro ćemo Vas obavestiti o statusu Vaše porudžbine.</p>";
        $emailBody .= "<p>Srdačan pozdrav,<br>Tim Vaše Prodavnice</p>";
        
        $mail->Body    = $emailBody;
        $mail->AltBody = strip_tags(str_replace("<br>", "\n", $emailBody)); 

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Ispis detaljne greške ako SMTPDebug nije dovoljan ili za druge izuzetke
        error_log("Email nije poslat. PHPMailer greška: {$mail->ErrorInfo}");
        // Možete dodati i echo za direktan prikaz u Postmanu ako je potrebno za debug
        // echo "PHPMailer ErrorInfo: {$mail->ErrorInfo}"; 
        return false;
    }
}
?>
