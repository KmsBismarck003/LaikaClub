const fs = require('fs');

let c = fs.readFileSync('src/pages/EventDetail/EventDetail.jsx', 'utf8');

const importTarget = 'import { PurchaseModal, SuccessModal } from "./components/PurchaseModal/PurchaseModal";\r\nimport "./EventDetail.css";';
const importTargetLF = 'import { PurchaseModal, SuccessModal } from "./components/PurchaseModal/PurchaseModal";\nimport "./EventDetail.css";';

const replaceStr = `import { PurchaseModal, SuccessModal } from "./components/PurchaseModal/PurchaseModal";
import MerchProductModal from "./components/MerchSection/MerchProductModal";
import TicketSelectionPanel from "./components/TicketSelection/TicketSelectionPanel";
import "./EventDetail.css";`;

if (c.includes(importTarget)) {
  c = c.replace(importTarget, replaceStr);
  fs.writeFileSync('src/pages/EventDetail/EventDetail.jsx', c);
  console.log('SUCCESS CRLF');
} else if (c.includes(importTargetLF)) {
  c = c.replace(importTargetLF, replaceStr);
  fs.writeFileSync('src/pages/EventDetail/EventDetail.jsx', c);
  console.log('SUCCESS LF');
} else {
  console.log('NOT FOUND');
}
