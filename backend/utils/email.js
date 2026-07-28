import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export async function sendTransactionalEmail({ to, subject, htmlContent }) {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
    throw new Error("Email is not configured");
  }

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "JMIQuiz", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

export async function sendResultUpdateEmail({
  to,
  courseName,
  courseTypeName,
  notificationId,
  resultLink,
}) {
  const frontendUrl = process.env.FRONTEND_URL || "https://jmiquiz.live";
  const viewUrl = `${frontendUrl}/tracked-results?n=${notificationId}`;

  const htmlContent = `
    <h2>JMI Result Update</h2>
    <p>A new or updated result was detected for:</p>
    <p><strong>${courseName}</strong>${courseTypeName ? ` (${courseTypeName})` : ""}</p>
    ${resultLink ? `<p><a href="${resultLink}">Open result PDF / link</a></p>` : ""}
    <p><a href="${viewUrl}">View tracked result on JMIQuiz</a></p>
    <p>Or copy this link: ${viewUrl}</p>
  `;

  await sendTransactionalEmail({
    to,
    subject: `JMI result update: ${courseName}`,
    htmlContent,
  });
}
