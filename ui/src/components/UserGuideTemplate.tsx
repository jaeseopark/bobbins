import { ReactNode } from "react";

import { Grid as ChakraGrid, HStack, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";

const YT_ICON_PATH = "/template-assets/images/youtube-logo.svg";
const CONTACT_YT_ICON_PATH = "/template-assets/images/contact-youtube.svg";
const CONTACT_INST_ICON_PATH = "/template-assets/images/contact-instagram.svg";
const CONTACT_WEB_ICON_PATH = "/template-assets/images/contact-website.svg";
const CONTACT_EMAIL_ICON_PATH = "/template-assets/images/contact-email.svg";
const PAPER_ICON_PATH = "/template-assets/images/paper.svg";
const SCALE_ICON_PATH = "/template-assets/images/scale.svg";
const CUT_ICON_PATH = "/template-assets/images/scissors.svg";
const MARKER_ICON_PATH = "/template-assets/images/marker.svg";
const MEASURE_ICON_PATH = "/template-assets/images/measure.svg";
const NEEDLE_ICON_PATH = "/template-assets/images/needle.svg";

import "./UserGuideTemplate.scss";

const DEFAULT_GRID_COLUMN_COUNT = 3;

type GridElement = {
  icon: string | ReactNode;
  title: string;
  body: string | ReactNode;
};

const Grid = ({ content, columns, gap }: { content: GridElement[]; columns?: number; gap?: string }) => (
  <ChakraGrid templateColumns={`repeat(${columns || DEFAULT_GRID_COLUMN_COUNT}, 1fr)`} gap={gap || "6px"}>
    {content.map(({ icon, title, body }) => (
      <div className="grid-item">
        <div className="icon-and-title">
          {icon}
          <span class="title">{title}</span>
        </div>
        <div>
          <p>{body}</p>
        </div>
      </div>
    ))}
  </ChakraGrid>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="section">
      <div className="section-header">
        <Heading size="sm">{title}</Heading>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
};

const PrintingGuidelines = () => (
  <Grid
    content={[
      {
        icon: <img src={PAPER_ICON_PATH} />,
        title: "Use the right paper size",
        body: "The PDF files are made to be printed on the US Letter or the A4.",
      },
      {
        icon: <img src={SCALE_ICON_PATH} />,
        title: "Print at a 100% scale",
        body: "Print at a 100% scale on center, or with the Actual Size option turned on. Do not select Scale to Fit Media or Fit to Printable Area.",
      },
      {
        icon: <img src={MEASURE_ICON_PATH} />,
        title: "Check the scale squares",
        body: 'Ensure the scale squares are printed to the correct sizes -- 1" and 1cm.',
      },
    ]}
  />
);

const AboutThisProject = () => (
  <Grid
    columns={2}
    gap="24px"
    content={[
      {
        icon: <img src={CUT_ICON_PATH} />,
        title: "Review the seam allowances",
        body: "There is {{ number_of_pieces }} pieces without the seam allowance in this project. Check before you cut!",
      },
      {
        icon: <img className="enlarge-50" src={MARKER_ICON_PATH} />,
        title: "Mark the notches",
        body: "Marking the notches at the start makes the project go easier and faster.",
      },
    ]}
  />
);

const AsYouAreSewing = () => (
  <Grid
    columns={4}
    content={[
      { icon: <img src={NEEDLE_ICON_PATH} />, title: "Seam allowances", body: "{{ seam_allowance_description }}" },
      { icon: <img src={NEEDLE_ICON_PATH} />, title: "Top Stitch", body: "top_stitch_description" },
      { icon: <img src={NEEDLE_ICON_PATH} />, title: "Baste", body: "baste_stitch_description" },
      {
        icon: <img src={NEEDLE_ICON_PATH} />,
        title: "Backstitch",
        body: "Backstitch 2-3 times at the begininng and at the end.",
      },
    ]}
  />
);

const Materials = () => (
  <table className="materials">
    <tbody>
      <tr>
        <td className="col1">
        Exterior Fabric
        </td>
        <td>
          Cotton 100%
        </td>
      </tr>
    </tbody>
  </table>
);

const UserGuideTemplate = () => {
  const sections: { [title: string]: ReactNode } = {
    "Printing Guidelines": <PrintingGuidelines />,
    "About {{ name }}": <AboutThisProject />,
    "As You Are Sewing": <AsYouAreSewing />,
    Materials: <Materials />,
  };

  const nameVariable = "{{ name }}";

  return (
    <div className="outer-container">
      <div className="container">
        <div className="header band">
          <div>
            <h2>Thank you for purchasing {nameVariable}!</h2>
          </div>
        </div>
        <div className="content sections">
          {Object.entries(sections).map(([title, content]) => (
            <Section key={title} title={title}>
              {content}
            </Section>
          ))}

          <div className="video-link-container">
            <a href="{{ tutorialLink }}" target="_blank">
              <Button leftIcon={<img className="youtube" src={YT_ICON_PATH} />}>Start watching</Button>
            </a>
          </div>
        </div>
        <HStack className="footer band">
          <h2>Ask questions or share your projects</h2>
          <a className="contact youtube" href="http://youtube.com/@sewingstroll" target="_blank">
            <img src={CONTACT_YT_ICON_PATH} />
            {/* <span>@SewingStroll</span> */}
          </a>
          <a className="contact instagram" href="http://instagram.com/sewingstroll" target="_blank">
            <img src={CONTACT_INST_ICON_PATH} />
            {/* <span>@SewingStroll</span> */}
          </a>

          <a className="contact instagram" href="http://sewingstroll.com" target="_blank">
            <img src={CONTACT_WEB_ICON_PATH} />
            {/* <span>sewingstroll.com</span> */}
          </a>

          <a className="contact email" href="mailto:khloe.sim@icloud.com" target="_blank">
            <img src={CONTACT_EMAIL_ICON_PATH} />
          </a>
        </HStack>
      </div>
    </div>
  );
};

export default UserGuideTemplate;
