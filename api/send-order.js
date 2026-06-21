import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nom, prenom, email, telephone, adresse, code_postal, ville, pays, notes, panier, total_ttc } = req.body;

    // Email pour l'admin
    const adminEmail = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: 'vanosselt.rayane@gmail.com',
      subject: `Nouvelle commande AÉRIS - ${nom} ${prenom}`,
      html: `
        <h2>Nouvelle Commande</h2>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-BE')}</p>

        <h3>Informations client</h3>
        <p><strong>Nom :</strong> ${nom} ${prenom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>

        <h3>Adresse de livraison</h3>
        <p>${adresse}<br>${code_postal} ${ville}<br>${pays}</p>

        <h3>Commande</h3>
        <p>${panier.replace(/\|/g, '<br>')}</p>
        <p style="font-weight: bold; font-size: 1.2em;">Total : ${total_ttc}</p>

        ${notes ? `<h3>Demandes spéciales</h3><p>${notes}</p>` : ''}
      `
    });

    // Email de confirmation pour le client
    const clientEmail = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: email,
      subject: 'Confirmation de votre commande AÉRIS',
      html: `
        <h2>Merci pour votre commande !</h2>
        <p>Bonjour ${prenom},</p>

        <p>Nous avons bien reçu votre demande. Un devis détaillé vous sera envoyé par email sous peu.</p>

        <h3>Résumé de votre commande</h3>
        <p>${panier.replace(/\|/g, '<br>')}</p>
        <p style="font-weight: bold; font-size: 1.2em;">Total : ${total_ttc}</p>

        <h3>Adresse de livraison</h3>
        <p>${adresse}<br>${code_postal} ${ville}<br>${pays}</p>

        <p>Nous vous contacterons au numéro ${telephone} pour confirmer les détails de votre commande.</p>

        <p style="margin-top: 2em; color: #666; font-size: 0.9em;">
          © 2026 AÉRIS — Moustiquaires sur mesure<br>
          Fabrication européenne · Livraison 10-15 jours · Garantie 5 ans
        </p>
      `
    });

    if (adminEmail.error || clientEmail.error) {
      return res.status(500).json({
        error: 'Erreur lors de l\'envoi des emails',
        details: adminEmail.error || clientEmail.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Commande reçue et emails envoyés',
      adminEmailId: adminEmail.id,
      clientEmailId: clientEmail.id
    });

  } catch (error) {
    console.error('Erreur serveur :', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
}
