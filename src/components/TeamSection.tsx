import { m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/common/SectionHeading";
import { cardHover, entranceEase, revealUp, viewportOnce } from "@/lib/motion";

const members = [
  { id: "ali", imageSrc: "/team/ali-priyatna-portrait.jpg" },
  {
    id: "elena",
    imageSrc: "/team/Elena_Headshot.jpeg",
    imagePositionClassName: "object-[50%_30%]",
  },
  {
    id: "priyatna",
    imageSrc: "/team/priyatna-priyatna.jpeg",
    imagePositionClassName: "object-[50%_15%]",
  },
  {
    id: "anastasia",
    imageSrc: "/team/anastasia-kurer.jpeg",
    imagePositionClassName: "object-[50%_20%]",
  },
] as const;

export default function TeamSection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="team" className="border-b border-border/70 bg-secondary/20 py-20">
      <div className="container mx-auto px-4">
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
          custom={shouldReduceMotion}
        >
          <SectionHeading
            title={t("team.title")}
            centered={false}
            className="mb-8"
          />
        </m.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {members.map((member, index) => {
            const name = t(`team.members.${member.id}.name`);
            const title = t(`team.members.${member.id}.title`);
            const responsibility = t(`team.members.${member.id}.responsibility`);
            return (
              <m.div
                key={member.id}
                className="rounded-[28px] border border-border/80 bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-elegant"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={revealUp}
                custom={shouldReduceMotion}
                transition={shouldReduceMotion ? undefined : { delay: index * 0.08, duration: 0.5, ease: entranceEase }}
                whileHover={shouldReduceMotion ? undefined : cardHover.whileHover}
                whileTap={shouldReduceMotion ? undefined : cardHover.whileTap}
              >
                <div className="flex items-center gap-5">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--accent))_100%)] text-2xl font-semibold tracking-tight text-primary">
                    <img
                      src={member.imageSrc}
                      alt={name}
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className={`h-full w-full rounded-[24px] object-cover ${member.imagePositionClassName ?? "object-center"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      {responsibility}
                    </p>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
