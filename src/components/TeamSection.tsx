import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeading } from "@/components/common/SectionHeading";

const members = ["ali", "anastasia", "priyatna"] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamSection() {
  const { t } = useLanguage();

  return (
    <section id="team" className="border-b border-border/70 bg-secondary/20 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={t("team.title")}
          centered={false}
          className="mb-8"
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {members.map((member) => {
            const name = t(`team.members.${member}.name`);
            const role = t(`team.members.${member}.role`);
            return (
              <div
                key={member}
                className="rounded-[28px] border border-border/80 bg-card p-6 shadow-card"
              >
                <div className="flex items-center gap-5">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--accent))_100%)] text-2xl font-semibold tracking-tight text-primary">
                    <div className="absolute inset-x-4 bottom-3 h-4 rounded-full bg-primary/12 blur-md" />
                    <span className="relative">{getInitials(name)}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
