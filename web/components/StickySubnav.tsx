import SectionLink from "./SectionLink";

export default function StickySubnav() {
  return (
    <>
      <div className="sticky-subnav">
        <div className="wrap">
          <SectionLink href="#programs">Who WaterSource Is For</SectionLink>
          <SectionLink href="#hidden-problem">Rethink Your Water</SectionLink>
          <SectionLink href="#founder">Meet Mrs Wee</SectionLink>
          <SectionLink href="#method">Discovery Journey</SectionLink>
          <SectionLink href="#properties">8 Water Properties</SectionLink>
          <SectionLink href="#consultation">Guided Consultation</SectionLink>
        </div>
      </div>
    </>
  );
}
