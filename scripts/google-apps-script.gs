/**
 * Google Apps Script — Webhook para recursos gratuitos de kicode
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet → Extensiones → Apps Script
 * 2. Pega este código completo
 * 3. Modifica EMAIL_SENDER_NAME y los PDF_URLS
 * 4. Haz clic en "Implementar" → "Nueva implementación"
 * 5. Tipo: "Aplicación web"
 * 6. Ejecutar como: "Yo" (tu cuenta)
 * 7. Quién tiene acceso: "Cualquier persona"
 * 8. Copia la URL generada y pégala en tu código frontend (WEBHOOK_URL)
 */

const EMAIL_SENDER_NAME = "kicode";

// Mapeo de recursos a URLs de PDF en Google Drive
// Reemplaza "#" con las URLs reales de tus PDFs
const PDF_URLS = {
  "Guía: Automatización para Negocios": "#",
  "WhatsApp Business para PyMEs": "#",
  "Calculadora de ROI": "#",
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { nombre, email, telefono, recurso, pdfUrl } = data;

    // Guardar en Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Crear encabezados si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet
        .getRange(1, 1, 1, 5)
        .setValues([["Nombre", "Email", "Teléfono", "Recurso", "Fecha"]]);
    }

    // Agregar fila con los datos
    sheet.appendRow([
      nombre,
      email,
      telefono,
      recurso,
      new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
    ]);

    // Determinar URL del PDF
    const finalPdfUrl =
      pdfUrl && pdfUrl !== "#" ? pdfUrl : PDF_URLS[recurso] || "#";

    // Enviar email
    const subject = `Tu recurso gratis: ${recurso}`;
    const htmlBody = getEmailTemplate(nombre, recurso, finalPdfUrl);

    GmailApp.sendEmail(email, subject, "", {
      htmlBody: htmlBody,
      name: EMAIL_SENDER_NAME,
    });

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getEmailTemplate(nombre, recurso, pdfUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background:#f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7; padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden;">
              <!-- Header con gradiente -->
              <tr>
                <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 30px; text-align:center;">
                  <h1 style="font-size:24px; font-weight:700; color:#1d1d1f; margin:0;">kicode</h1>
                </td>
              </tr>
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size:28px; font-weight:800; color:#1d1d1f; margin:0 0 16px;">
                    ¡Hola ${nombre}!
                  </h2>
                  <p style="font-size:16px; color:#6e6e73; line-height:1.6; margin:0 0 8px;">
                    Gracias por tu interés en <strong style="color:#1d1d1f;">${recurso}</strong>.
                  </p>
                  <p style="font-size:16px; color:#6e6e73; line-height:1.6; margin:0 0 32px;">
                    Tu recurso ya está listo para descargar.
                  </p>
                  <!-- Botón -->
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="background:#2563eb; border-radius:14px; padding:14px 32px; text-align:center;">
                        <a href="${pdfUrl}" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:block;">
                          Obtener Recurso Gratis →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; border-top:1px solid #e5e7eb; text-align:center;">
                  <p style="font-size:13px; color:#86868b; margin:0;">
                    © ${new Date().getFullYear()} kicode — Automatiza tu negocio
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Función de prueba para verificar que el script funciona
function testDoPost() {
  const testEvent = {
    postData: {
      contents: JSON.stringify({
        nombre: "Test User",
        email: "test@example.com",
        telefono: "+51 999999999",
        recurso: "Guía: Automatización para Negocios",
        pdfUrl: "#",
      }),
    },
  };

  const result = doPost(testEvent);
  Logger.log(result.getContent());
}
