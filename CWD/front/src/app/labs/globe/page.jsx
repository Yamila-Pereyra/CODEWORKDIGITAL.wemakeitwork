import GlobeLab from "@/components/labs/globe/GlobeLab";

export const metadata = {
  title: "Globe Lab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobeLabPage() {
  return <GlobeLab progressiveReveal />;
}
