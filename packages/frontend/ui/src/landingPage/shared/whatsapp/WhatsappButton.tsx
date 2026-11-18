import { FloatingWhatsApp } from "react-floating-whatsapp";

/* eslint-disable-next-line */
export interface WhatsappButtonProps {}

export const WhatsappButton = (props: WhatsappButtonProps) => {
  return (
    <FloatingWhatsApp
      phoneNumber="+436642448742"
      accountName="Michael Riegler"
      avatar="/brand/helden/whatsapp-synergie-held.webp"
      chatMessage={`Hallo! 🤝 \nWie können wir Ihnen bei Ihrem Projekt helfen? \nSchreiben Sie uns gerne eine Nachricht.`}
      chatboxHeight={400}
      placeholder="Nachricht schreiben..."
      notificationSound={false}
      notification={true}
      notificationDelay={20}
      notificationLoop={1}
      statusMessage="Antwortet innerhalb 24 Stunden"
    />
  );
};

export default WhatsappButton;
