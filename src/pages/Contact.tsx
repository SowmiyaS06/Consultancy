import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Contact VEL SUPER MARKET
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Reach us for product availability, bulk enquiries, or store support.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="rounded-2xl border border-border/60 bg-card/80 p-6 md:p-8 shadow-soft">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                  Contact Details
                </h2>
                <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <span className="font-medium text-foreground">Phone</span>
                    <span>+91-9360007775</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <span className="font-medium text-foreground">Email</span>
                    <span className="break-all">contact@velsupermarket.com</span>
                  </div>
                </div>

                <form
                  className="mt-6 grid grid-cols-1 gap-4"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input id="contact-name" placeholder="Your name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-phone">Phone number</Label>
                    <Input id="contact-phone" placeholder="Your phone number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us what you need"
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-fit">
                    Send Enquiry
                  </Button>
                </form>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/80 p-6 md:p-8 shadow-soft">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                  Store Location
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  VEL SUPER MARKET, Dharapuram - Tirupur.
                </p>
                <div className="mt-5 rounded-xl overflow-hidden border border-border/60">
                  <iframe
                    title="VEL SUPER MARKET location"
                    src="https://www.google.com/maps?q=VEL%20SUPER%20MARKET&output=embed"
                    className="h-64 w-full"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm md:text-base">
                  <span className="text-muted-foreground">Open daily for walk-ins</span>
                  <a
                    href="https://www.google.com/maps?q=VEL%20SUPER%20MARKET"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary font-medium hover:underline"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
