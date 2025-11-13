"use client";

import { ChangeEvent, FormEvent, useEffect, useId, useRef, useState } from "react";

import { AnimatedText } from "@/components/ui/animated-text";
import { AnimatedHeadline } from "@/components/ui/animated-headline";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { ServicesTypingContent } from "@/components/ui/services-typing-content";
import { SiteHeaderCta } from "@/components/site-header-cta";
import Image from "next/image";

type MarqueeItem =
  | { type: "image"; src: string; alt: string }
  | { type: "text"; label: string };

type ProjectMedia =
  | {
      type: "single";
      images: { src: string; alt: string }[];
    }
  | {
      type: "sequence";
      images: { src: string; alt: string }[];
    }
  | {
      type: "video";
      src: string;
      poster?: string;
    };

type Project = {
  title: string;
  tags: string[];
  media: ProjectMedia;
};

type ContactFormFields = {
  name: string;
  email: string;
  business: string;
  message: string;
};

const createInitialContactForm = (): ContactFormFields => ({
  name: "",
  email: "",
  business: "",
  message: ""
});

const createInitialTouchedState = (): Record<keyof ContactFormFields, boolean> => ({
  name: false,
  email: false,
  business: false,
  message: false
});

const marqueeItems: MarqueeItem[] = [
  { type: "image", src: "/walmart.webp", alt: "Walmart" },
  { type: "image", src: "/nsf.webp", alt: "National Science Foundation" },
  { type: "image", src: "/lane.webp", alt: "Lane Interior Design" },
  { type: "image", src: "/vandy2.webp", alt: "Vanderbilt" },
];

const serviceItems = ["Web Design", "SEO", "Branding", "Marketing"];

const projects: Project[] = [
  {
    title: "Lane Interior Design",
    tags: ["Web Design", "Branding", "Marketing"],
    media: {
      type: "video",
      src: "/lane-demo.webm",
      poster: "/sophia1.webp"
    }
  }
];

export default function HomePage() {
  const marqueeLoop = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];
  const idBase = useId();

  const contactSectionRef = useRef<HTMLElement | null>(null);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState<ContactFormFields>(() => createInitialContactForm());
  const [touchedFields, setTouchedFields] = useState<Record<keyof ContactFormFields, boolean>>(() =>
    createInitialTouchedState()
  );
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormFields, string>>>({});

  const fieldIds = {
    name: `${idBase}-footer-name`,
    email: `${idBase}-footer-email`,
    business: `${idBase}-footer-business`,
    message: `${idBase}-footer-message`
  };

  const errorIds = {
    name: `${fieldIds.name}-error`,
    email: `${fieldIds.email}-error`,
    business: `${fieldIds.business}-error`,
    message: `${fieldIds.message}-error`
  };

  const collapsiblePanelId = `${idBase}-footer-panel`;
  const successMessageId = `${idBase}-footer-success`;

  useEffect(() => {
    const footer = contactSectionRef.current;
    if (!footer || isContactVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContactVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, [isContactVisible]);

  const validateForm = (data: ContactFormFields) => {
    const nextErrors: Partial<Record<keyof ContactFormFields, string>> = {};
    const emailValue = data.email.trim();

    if (!data.name.trim()) {
      nextErrors.name = "Please share your name.";
    }

    if (!emailValue) {
      nextErrors.email = "Email helps me reach you back.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = "Add a valid email address.";
    }

    if (!data.business.trim()) {
      nextErrors.business = "Let me know your business or organization.";
    }

    if (!data.message.trim()) {
      nextErrors.message = "A short note sets the stage.";
    }

    return nextErrors;
  };

  const handleFieldChange =
    (field: keyof ContactFormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      const updatedForm = {
        ...formData,
        [field]: value
      };

      setFormData(updatedForm);

      if (touchedFields[field]) {
        setFormErrors((previous) => {
          const nextErrors = { ...previous };
          const updatedErrors = validateForm(updatedForm);
          if (updatedErrors[field]) {
            nextErrors[field] = updatedErrors[field];
          } else {
            delete nextErrors[field];
          }
          return nextErrors;
        });
      }
    };

  const handleFieldBlur = (field: keyof ContactFormFields) => {
    setTouchedFields((previous) => ({
      ...previous,
      [field]: true
    }));

    setFormErrors((previous) => {
      const nextErrors = { ...previous };
      const updatedErrors = validateForm(formData);
      if (updatedErrors[field]) {
        nextErrors[field] = updatedErrors[field];
      } else {
        delete nextErrors[field];
      }
      return nextErrors;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTouched: Record<keyof ContactFormFields, boolean> = {
      name: true,
      email: true,
      business: true,
      message: true
    };
    setTouchedFields(nextTouched);

    const nextErrors = validateForm(formData);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormStatus("idle");
      return;
    }

    setFormStatus("submitting");
    window.setTimeout(() => {
      setFormStatus("success");
      setFormData(createInitialContactForm());
      setTouchedFields(createInitialTouchedState());
      setFormErrors({});
    }, 600);
  };

  const handleReset = () => {
    setFormStatus("idle");
    setFormData(createInitialContactForm());
    setTouchedFields(createInitialTouchedState());
    setFormErrors({});
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <span className="site-header__name">
            Solomon Hearn
          </span>
          <SiteHeaderCta />
        </div>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero__shell">
            <div className="landing-hero__pattern landing-hero__pattern--left" aria-hidden="true">
              <Image src="/side.webp" alt="" width={240} height={480} priority />
            </div>
            <div className="landing-hero__pattern landing-hero__pattern--right" aria-hidden="true">
              <Image src="/side.webp" alt="" width={240} height={480} priority />
            </div>
            <div className="landing-hero__core">
              <Image
                src="/sh.webp"
                alt="Solomon Hearn monogram logo"
                className="landing-hero__logo"
                width={360}
                height={360}
                priority
              />
              <AnimatedText
                text="Digital Strategist"
                textClassName="landing-hero__title landing-hero__title--animated"
                underlineClassName="hidden"
                role="heading"
                aria-level={1}
              />
              <p className="landing-hero__subtitle">
                Boston-based tech consultant helping local businesses modernize their online presence.
              </p>
            </div>
          </div>
          <div className="landing-hero__brands">
            <div className="logo-marquee">
              <div className="logo-track">
                {marqueeLoop.map((item, index) => (
                  <div
                    key={`${item.type}-${index}`}
                    className={`logo-item${
                      item.type === "text"
                        ? " logo-text"
                        : item.type === "image" && item.alt === "Walmart"
                          ? " logo-item--walmart"
                          : ""
                    }`}
                  >
                    {item.type === "image" ? (
                      <Image src={item.src} alt={item.alt} width={160} height={42} />
                    ) : (
                      item.label
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="services-background" aria-hidden="true" />
          <div className="services-container">
            <ContainerScroll titleComponent={null}>
              <ServicesTypingContent serviceItems={serviceItems} />
            </ContainerScroll>
          </div>
        </section>

        <section className="projects-section" id="projects">
          <div className="projects-container">
            <header className="projects-header">
              <div className="projects-header-copy">
                <h2 className="projects-title">
                  <AnimatedHeadline
                    prefix="Elevate your brand with "
                    words={["design.", "analytics.", "storytelling.", "creativity."]}
                  />
                </h2>
              </div>
            </header>
            <div className="projects-grid">
              {projects.map((project, projectIndex) => (
                <article key={project.title} className="project-card">
                  <div
                    className={`project-media${
                      project.media.type === "sequence" ? " project-media--sequence" : ""
                    }`}
                  >
                    {project.media.type === "sequence" ? (
                      <div className="project-sequence">
                        {project.media.images.map((image, imageIndex) => (
                          <Image
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="project-sequence__image"
                            sizes="(max-width: 768px) 100vw, 720px"
                            priority={projectIndex === 0 && imageIndex === 0}
                          />
                        ))}
                      </div>
                    ) : project.media.type === "video" ? (
                      <video
                        className="project-video"
                        src={project.media.src}
                        poster={project.media.poster}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={`${project.title} demo video`}
                      />
                    ) : (
                      <Image
                        src={project.media.images[0]?.src ?? ""}
                        alt={project.media.images[0]?.alt ?? project.title}
                        width={1600}
                        height={1000}
                        className="project-image"
                        priority={projectIndex === 0}
                      />
                    )}
                  </div>
                  <div className="project-copy">
                    <h3 className="project-title">{project.title}</h3>
                    <ul className="project-tags" aria-label={`Services provided for ${project.title}`}>
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        className={`site-footer${isContactVisible ? " is-revealed" : ""}`}
        id="contact"
        ref={contactSectionRef}
      >
        <div className="site-footer__inner">
          <div className="site-footer__content">
            <h2 className="site-footer__title">Looking for a partner in brand?</h2>
            <p className="site-footer__subtitle">
              Whether it&apos;s a refresh or a rethink, I&apos;d love to talk.
            </p>
          </div>
          <div className="site-footer__meta">
            <span className="site-footer__copyright">
              2025&reg; Solomon Hearn
            </span>
            <div className="site-footer__actions" role="group" aria-label="Contact options">
              <p className="site-footer__response-note">
                I reply within a couple business days with a kickoff plan and next steps.
              </p>
              <div className="site-footer__button-group">
                <a className="site-footer__btn site-footer__btn--primary" href="mailto:hello@solomonhearn.com">
                  Let&apos;s connect
                </a>
                <a
                  className="site-footer__btn site-footer__btn--secondary"
                  href="Solomon-Hearn-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resume
                </a>
              </div>
              <div className="site-footer__collapsible">
                <button
                  type="button"
                  className="site-footer__collapsible-toggle"
                  aria-expanded={isContactFormOpen}
                  aria-controls={collapsiblePanelId}
                  onClick={() => setIsContactFormOpen((previous) => !previous)}
                >
                  <span>Prefer to stay here?</span>
                  <span className="site-footer__collapsible-icon" aria-hidden="true" />
                </button>
                <div
                  id={collapsiblePanelId}
                  className={`site-footer__collapsible-panel${isContactFormOpen ? " is-open" : ""}`}
                  aria-hidden={!isContactFormOpen}
                >
                  <div className="site-footer__collapsible-content">
                    {formStatus === "success" ? (
                      <div
                        className="site-footer__form-success"
                        role="status"
                        aria-live="polite"
                        id={successMessageId}
                      >
                        <strong>Message received</strong>
                        <p>I&apos;ll reach out within two business days with next steps.</p>
                        <button type="button" className="site-footer__form-reset" onClick={handleReset}>
                          Send another note
                        </button>
                      </div>
                    ) : (
                      <form className="site-footer__form" noValidate onSubmit={handleSubmit}>
                        <div className="site-footer__form-row">
                          <div className="site-footer__field">
                            <label className="site-footer__label" htmlFor={fieldIds.name}>
                              Name
                            </label>
                            <input
                              id={fieldIds.name}
                              name="name"
                              className="site-footer__input"
                              type="text"
                              autoComplete="name"
                              value={formData.name}
                              onChange={handleFieldChange("name")}
                              onBlur={() => handleFieldBlur("name")}
                              aria-invalid={Boolean(formErrors.name)}
                              aria-describedby={formErrors.name ? errorIds.name : undefined}
                              tabIndex={isContactFormOpen ? 0 : -1}
                            />
                            {formErrors.name && touchedFields.name ? (
                              <span className="site-footer__field-error" id={errorIds.name}>
                                {formErrors.name}
                              </span>
                            ) : null}
                          </div>
                          <div className="site-footer__field">
                            <label className="site-footer__label" htmlFor={fieldIds.email}>
                              Email
                            </label>
                            <input
                              id={fieldIds.email}
                              name="email"
                              className="site-footer__input"
                              type="email"
                              autoComplete="email"
                              value={formData.email}
                              onChange={handleFieldChange("email")}
                              onBlur={() => handleFieldBlur("email")}
                              aria-invalid={Boolean(formErrors.email)}
                              aria-describedby={formErrors.email ? errorIds.email : undefined}
                              inputMode="email"
                              tabIndex={isContactFormOpen ? 0 : -1}
                            />
                            {formErrors.email && touchedFields.email ? (
                              <span className="site-footer__field-error" id={errorIds.email}>
                                {formErrors.email}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="site-footer__field">
                          <label className="site-footer__label" htmlFor={fieldIds.business}>
                            Business
                          </label>
                          <input
                            id={fieldIds.business}
                            name="business"
                            className="site-footer__input"
                            type="text"
                            autoComplete="organization"
                            value={formData.business}
                            onChange={handleFieldChange("business")}
                            onBlur={() => handleFieldBlur("business")}
                            aria-invalid={Boolean(formErrors.business)}
                            aria-describedby={formErrors.business ? errorIds.business : undefined}
                            tabIndex={isContactFormOpen ? 0 : -1}
                          />
                          {formErrors.business && touchedFields.business ? (
                            <span className="site-footer__field-error" id={errorIds.business}>
                              {formErrors.business}
                            </span>
                          ) : null}
                        </div>
                        <div className="site-footer__field">
                          <label className="site-footer__label" htmlFor={fieldIds.message}>
                            Message
                          </label>
                          <textarea
                            id={fieldIds.message}
                            name="message"
                            className="site-footer__textarea"
                            rows={3}
                            value={formData.message}
                            onChange={handleFieldChange("message")}
                            onBlur={() => handleFieldBlur("message")}
                            aria-invalid={Boolean(formErrors.message)}
                            aria-describedby={formErrors.message ? errorIds.message : undefined}
                            tabIndex={isContactFormOpen ? 0 : -1}
                          />
                          {formErrors.message && touchedFields.message ? (
                            <span className="site-footer__field-error" id={errorIds.message}>
                              {formErrors.message}
                            </span>
                          ) : null}
                        </div>
                        <button
                          className="site-footer__form-submit"
                          type="submit"
                          disabled={formStatus === "submitting"}
                          tabIndex={isContactFormOpen ? 0 : -1}
                        >
                          {formStatus === "submitting" ? "Sending..." : "Submit"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
