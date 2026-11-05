const { Resend } = require("resend");

function buildHtml({ header, body, footer }) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${header}</h2>
            <div>${body}</div>
            <hr />
            <p style="color: #888; font-size: 12px;">${footer}</p>
        </div>
    `;
}

async function sendEmail({ to, toName, subject, header, body, footer }) {
    if (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM) {
        throw new Error("As configurações de e-mail não foram definidas.");
    }

    const resend = new Resend(process.env.EMAIL_API_KEY);

    await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || "EasyFood"} <${process.env.EMAIL_FROM}>`,
        to: [to],
        subject,
        html: buildHtml({ header, body, footer }),
        text: `${header}\n\n${body.replace(/<br\s*\/?>/gi, "\n")}\n\n${footer}`
    });

    console.log(`[EMAIL] Enviado para ${toName || to} - "${subject}"`);
}

module.exports = {
    sendEmail
};
