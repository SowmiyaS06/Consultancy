import { MapPin, Phone, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container-custom py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">V</span>
              </div>
              <h3 className="text-xl font-bold">VEL SUPER MARKET</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted neighborhood store for all daily essentials. 
              Quality products at affordable prices.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-primary-foreground/90">
                  OPP. POONAIYABOOPATHI HOSPITAL,<br />
131/3 MINOR RAMANATHA NAGAR,<br />
DHARAPURAM,<br />
TIRUPUR (DT) - 638656.<br />
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-primary-foreground/90">
                  <p>+91-9360007775</p>
                  <p>+91-96595 64440</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Hours */}
          <div>
            <h4 className="font-bold text-lg mb-4">Store Hours</h4>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-primary-foreground/90">
                <p>Monday - Saturday: 8:00 AM - 9:00 PM</p>
                <p>Sunday: 9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/70">
          <p>© 2026 VEL SUPER MARKET. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
