import { FloatingWhatsApp } from "react-floating-whatsapp";

/* eslint-disable-next-line */
export interface WhatsappButtonProps {}

export const WhatsappButton = (props: WhatsappButtonProps) => {
  return (
    <FloatingWhatsApp
      phoneNumber="+436642448742"
      accountName="Michael Riegler"
      avatar="https://synergy-webservices-assets.b-cdn.net/frontend/landingPage/testimonialCarousel/1706609343142-2.jpeg"
      chatMessage={`Hallo! 🤝 \nWie können wir Ihnen bei Ihrem Projekt helfen? \nSchreiben Sie uns gerne eine Nachricht.`}
      chatboxHeight={400}
      placeholder="Nachricht schreiben..."
      notificationSound={true}
      notification={true}
      notificationDelay={20}
      notificationLoop={1}
      statusMessage="Antwortet innerhalb einer Stunde"
    />
  );
};

export default WhatsappButton;
