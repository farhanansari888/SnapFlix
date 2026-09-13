import Lightbox, { LightboxExternalProps } from "yet-another-react-lightbox";
import { Captions, Thumbnails, Counter, Zoom, Download } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/captions.css";

const Gallery: React.FC<Omit<LightboxExternalProps, "plugins">> = ({ ...props }) => {
  return (
    <Lightbox
      plugins={[Captions, Thumbnails, Counter, Zoom, Download]}
      thumbnails={{ showToggle: true, borderStyle: "none", imageFit: "cover" }}
      captions={{ showToggle: true, descriptionTextAlign: "center", hidden: true }}
      {...props}
    />
  );
};

export default Gallery;
