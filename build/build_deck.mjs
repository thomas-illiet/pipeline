import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const W = 1280, H = 720;
const C = { bg: "#FFFFFF", panel: "#E9F5EF", panel2: "#DCEFE5", ink: "#123F32", muted: "#60756B", orange: "#00965E", cyan: "#58BE91", green: "#006B45", red: "#C94F5D", line: "#CBDCD3" };
const FONT = "Arial", DISPLAY = "Arial";
const LOGO = path.resolve("build/reference-assets/image.png");
const COVER_IMAGE = path.resolve("build/reference-assets/image3.png");
const LOGO_BYTES = await fs.readFile(LOGO);
const COVER_IMAGE_BYTES = await fs.readFile(COVER_IMAGE);
const outDir = path.resolve("output");
const tmpDir = path.resolve("build/.codex-finalizer");
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(tmpDir, { recursive: true });

const deck = Presentation.create({ slideSize: { width: W, height: H } });

function box(slide, x, y, w, h, fill=C.panel, radius=true, stroke=C.line) {
  return slide.shapes.add({ geometry: radius ? "roundRect" : "rect", position:{left:x,top:y,width:w,height:h}, fill, line:{style:"solid",fill:stroke,width:1} });
}
function text(slide, value, x, y, w, h, size=22, color=C.ink, bold=false, align="left") {
  const s = slide.shapes.add({ geometry:"textbox", position:{left:x,top:y,width:w,height:h}, fill:"none", line:{fill:"none",width:0} });
  s.text = value; s.text.style = { fontFamily: bold ? DISPLAY : FONT, fontSize:size, color, bold, alignment:align, verticalAlignment:"middle" }; return s;
}
function base(title, section, n) {
  const s = deck.slides.add(); s.background.fill = C.bg;
  s.images.add({blob:LOGO_BYTES,contentType:"image/png",fit:"contain",position:{left:1128,top:24,width:90,height:28}});
  text(s, section.toUpperCase(), 55, 32, 500, 22, 14, C.orange, true);
  text(s, title, 54, 72, 1080, 62, 42, C.ink, true);
  text(s, String(n).padStart(2,"0"), 1170, 675, 54, 22, 14, C.ink, false, "right");
  return s;
}
function label(slide, value, x, y, w, fill=C.panel2, color=C.ink) {
  const b=box(slide,x,y,w,48,fill,true,fill); b.text=value; b.text.style={fontFamily:FONT,fontSize:17,bold:true,color,alignment:"center",verticalAlignment:"middle"}; return b;
}
function bullet(slide, titleValue, body, x, y, w, accent=C.cyan, titleColor=C.ink, bodyColor=C.muted) {
  slide.shapes.add({geometry:"ellipse",position:{left:x,top:y+8,width:14,height:14},fill:accent,line:{fill:"none",width:0}});
  text(slide,titleValue,x+28,y,w-28,30,20,titleColor,true);
  text(slide,body,x+28,y+34,w-28,58,16,bodyColor,false);
}

// 1 — Cover
{
  const s=deck.slides.add(); s.background.fill=C.bg;
  s.images.add({blob:LOGO_BYTES,contentType:"image/png",fit:"contain",position:{left:46,top:26,width:286,height:80}});
  s.images.add({blob:COVER_IMAGE_BYTES,contentType:"image/png",fit:"cover",position:{left:640,top:118,width:640,height:514}});
  text(s,"La pipeline\nVPIC",58,180,550,150,58,C.ink,true);
  s.shapes.add({geometry:"rect",position:{left:60,top:370,width:72,height:5},fill:C.orange,line:{fill:"none",width:0}});
  text(s,"De la correction d’un bug\nau déploiement en production",58,400,540,100,28,C.ink);
  text(s,"Thomas Illiet  ·  Présentation 50 minutes",60,590,540,48,18,C.ink);
  label(s,"CI / CD",430,520,150,C.orange,"#FFFFFF");
}

// 2 — Agenda
{
  const s=base("Le fil de la présentation","Introduction",2);
  const items=[["01","Contexte VPIC","10 min"],["02","Pipeline et architecture","10 min"],["03","Démonstration","8 min"],["04","Bilan et gains","3 min"],["05","Questions","7 min"]];
  items.forEach((it,i)=>{const y=160+i*92; text(s,it[0],82,y,60,52,26,C.orange,true); text(s,it[1],156,y,740,52,23,C.ink,true); text(s,it[2],1015,y,150,52,18,C.muted,false,"right"); if(i<4)s.shapes.add({geometry:"rect",position:{left:156,top:y+64,width:1000,height:1},fill:C.line,line:{fill:"none",width:0}});});
}

// 3 — App
{
  const s=base("VPIC en une minute","Contexte VPIC",3);
  text(s,"À quoi sert l’application ?",82,154,470,44,24,C.orange,true);
  text(s,"Présentez ici le besoin métier servi par VPIC, ses utilisateurs et le résultat attendu.",82,206,470,112,22,C.ink);
  box(s,650,154,500,350,C.panel,true);
  text(s,"UTILISATEUR",688,192,160,32,16,C.muted,true,"center"); label(s,"VPIC",822,282,160,C.orange,C.bg); text(s,"RÉSULTAT MÉTIER",982,192,140,54,16,C.muted,true,"center");
  s.shapes.add({geometry:"chevron",position:{left:760,top:292,width:62,height:30},fill:C.cyan,line:{fill:"none",width:0}});
  s.shapes.add({geometry:"chevron",position:{left:982,top:292,width:62,height:30},fill:C.cyan,line:{fill:"none",width:0}});
  text(s,"À compléter avant la présentation : 1 phrase sur le problème métier et 1 phrase sur la valeur livrée.",82,554,1060,60,17,C.muted);
}

// 4 — Before
{
  const s=base("Avant la pipeline","Contexte VPIC",4);
  const cols=[["Déploiement","Étapes manuelles, dépendantes de quelques personnes"],["Tests","Exécution tardive et retours dispersés"],["Traçabilité","Difficile de relier une version au code déployé"],["Rétablissement","Rollback lent ou incertain en cas d’incident"]];
  cols.forEach((c,i)=>{const x=76+(i%2)*570, y=164+Math.floor(i/2)*210; box(s,x,y,520,170,C.panel,true); text(s,c[0],x+26,y+22,460,36,22,i===3?C.red:C.orange,true); text(s,c[1],x+26,y+68,458,76,18,C.ink);});
}

// 5 — Expectations
{
  const s=base("Difficultés concrètes et attentes","Contexte VPIC",5);
  text(s,"DIFFICULTÉS",84,154,460,34,17,C.red,true); text(s,"ATTENTES DE L’ÉQUIPE",696,154,460,34,17,C.green,true);
  const left=["Déploiements difficiles à reproduire","Détection tardive des défauts","Peu de visibilité sur l’état d’une livraison"];
  const right=["Un chemin standard du commit à la production","Des contrôles automatiques et lisibles","Un retour arrière simple et documenté"];
  left.forEach((v,i)=>bullet(s,v,"",88,214+i*112,500,C.red)); right.forEach((v,i)=>bullet(s,v,"",700,214+i*112,500,C.green));
  text(s,"Adaptez ces formulations avec 2 ou 3 incidents réels pour ancrer le récit.",84,586,1100,42,17,C.muted);
}

// 6 — Architecture
{
  const s=base("Architecture d’ensemble","Pipeline et architecture",6);
  const xs=[72,262,452,642,832,1022], names=["Bitbucket","Jenkins","Tests & Sonar","Registry","Argo CD","Kubernetes"];
  xs.forEach((x,i)=>{label(s,names[i],x,286,150,i===0?C.green:i===1?C.orange:i===4?"#0B7A53":C.panel2,i<2||i===4?"#FFFFFF":C.ink); if(i<5)s.shapes.add({geometry:"chevron",position:{left:x+155,top:298,width:30,height:24},fill:C.cyan,line:{fill:"none",width:0}});});
  text(s,"Code",72,240,150,24,15,C.muted,false,"center"); text(s,"Build",262,240,150,24,15,C.muted,false,"center"); text(s,"Qualité",452,240,150,24,15,C.muted,false,"center"); text(s,"Image",642,240,150,24,15,C.muted,false,"center"); text(s,"GitOps",832,240,150,24,15,C.muted,false,"center"); text(s,"Runtime",1022,240,150,24,15,C.muted,false,"center");
  box(s,262,410,530,92,C.panel,true); text(s,"Feedback rapide vers la pull request",290,428,470,48,19,C.orange,true,"center");
  text(s,"Chaque outil a une responsabilité claire. La promotion s’appuie sur des artefacts versionnés.",110,560,1060,50,19,C.ink,false,"center");
}

// 7 — Build
{
  const s=base("Les étapes de build","Pipeline et architecture",7);
  const stages=[["1","Checkout","Sources et dépendances"],["2","Tests","Unitaires et intégration"],["3","Lint","Règles de code"],["4","SonarQube","Analyse et quality gate"],["5","Docker","Image immuable"],["6","Publish","Registry versionné"]];
  stages.forEach((st,i)=>{const x=62+i*202; box(s,x,192,174,280,C.panel,true); text(s,st[0],x+18,210,44,38,23,C.orange,true); text(s,st[1],x+18,278,138,40,21,C.ink,true); text(s,st[2],x+18,334,138,82,16,C.muted); if(i<5)s.shapes.add({geometry:"chevron",position:{left:x+178,top:310,width:24,height:28},fill:C.cyan,line:{fill:"none",width:0}});});
  text(s,"Un échec stoppe la chaîne avant qu’un artefact non conforme atteigne l’environnement suivant.",86,540,1100,58,19,C.ink,false,"center");
}

// 8 — Deploy and resilience
{
  const s=base("Déploiement et contrôles de résilience","Pipeline et architecture",8);
  text(s,"PROMOTION",82,154,470,30,17,C.orange,true); text(s,"GARDE-FOUS",690,154,470,30,17,C.orange,true);
  const envs=[["DEV",C.cyan],["STAGING",C.orange],["PRODUCTION",C.green]];
  envs.forEach((e,i)=>{label(s,e[0],98+i*170,240,142,e[1],C.bg); if(i<2)s.shapes.add({geometry:"chevron",position:{left:244+i*170,top:251,width:24,height:26},fill:C.muted,line:{fill:"none",width:0}});});
  bullet(s,"Quality gate","La livraison s’arrête si le seuil SonarQube échoue.",700,214,450,C.red);
  bullet(s,"Tests post-déploiement","Les smoke tests vérifient les parcours critiques.",700,326,450,C.cyan);
  bullet(s,"État déclaré","Argo CD détecte et corrige les écarts de configuration.",700,438,450,C.green);
  text(s,"Précisez les validations manuelles éventuelles entre staging et production.",86,584,1080,44,17,C.muted);
}

// 9 — Versioning
{
  const s=base("Stratégie de versionnement","Pipeline et architecture",9);
  text(s,"Le code avance par pull request. Les releases figent une version déployable et traçable.",84,150,1090,58,21,C.ink);
  label(s,"feature/*",84,280,180,C.panel2); label(s,"pull request",314,280,180,C.panel2); label(s,"main",544,280,180,C.orange,C.bg); label(s,"release/*",774,280,180,C.panel2); label(s,"tag vX.Y.Z",1004,280,180,C.green,C.bg);
  [264,494,724,954].forEach(x=>s.shapes.add({geometry:"chevron",position:{left:x,top:291,width:30,height:26},fill:C.cyan,line:{fill:"none",width:0}}));
  box(s,544,408,410,112,C.panel,true); text(s,"À confirmer avec l’équipe",566,420,366,28,16,C.orange,true,"center"); text(s,"main vers dev, branches de release, règles de tags",566,454,366,44,17,C.ink,false,"center");
}

// 10 — Demo
{
  const s=base("Démonstration : du bug à la production","Démo vidéo",10);
  const steps=[["1","Bug signalé"],["2","Correction"],["3","Pull request"],["4","Merge main"],["5","Staging"],["6","Production"]];
  steps.forEach((st,i)=>{const x=54+i*205; text(s,st[0],x+48,188,80,38,23,C.orange,true,"center"); label(s,st[1],x,244,170,i===5?C.green:C.panel2,i===5?C.bg:C.ink); if(i<5)s.shapes.add({geometry:"chevron",position:{left:x+176,top:255,width:26,height:26},fill:C.cyan,line:{fill:"none",width:0}});});
  box(s,250,390,780,126,C.panel,true); text(s,"Points à commenter pendant la vidéo",282,404,720,30,18,C.orange,true,"center"); text(s,"Statut des jobs, quality gate, version de l’image et synchronisation Argo CD",282,448,720,44,18,C.ink,false,"center");
  text(s,"Durée cible : 8 minutes",84,580,1110,38,17,C.muted,false,"center");
}

// 11 — Rollback
{
  const s=base("Bonus : démonstration d’un rollback","Démo vidéo",11);
  label(s,"Version N",110,238,210,C.green,C.bg); label(s,"Incident détecté",404,238,220,C.red,C.bg); label(s,"Retour à N−1",708,238,220,C.orange,C.bg); label(s,"Service rétabli",1012,238,200,C.cyan,C.bg);
  [326,624,928].forEach(x=>s.shapes.add({geometry:"chevron",position:{left:x,top:249,width:48,height:26},fill:C.muted,line:{fill:"none",width:0}}));
  bullet(s,"Signal","Alerte ou test post-déploiement en échec.",138,410,430,C.red);
  bullet(s,"Action","Revenir au tag ou manifeste précédent.",684,410,430,C.orange);
  text(s,"Objectif de la séquence : montrer que le retour arrière est prévu, rapide et vérifiable.",84,574,1110,44,19,C.ink,false,"center");
}

// 12 — Gains
{
  const s=base("Bilan : avant et après","Bilan et gains",12);
  const rows=[["Durée de déploiement","À mesurer","À mesurer"],["Fréquence de livraison","À mesurer","À mesurer"],["Temps de rétablissement","À mesurer","À mesurer"],["Taux d’échec","À mesurer","À mesurer"]];
  text(s,"INDICATEUR",92,166,430,34,16,C.muted,true); label(s,"AVANT",652,158,176,"#FBECEF",C.red); label(s,"APRÈS",932,158,176,C.panel,C.green);
  rows.forEach((r,i)=>{const y=220+i*82; if(i%2===0)box(s,74,y-8,1090,66,C.panel,false,C.panel); text(s,r[0],92,y,470,46,19,C.ink,true); text(s,r[1],650,y,180,46,18,C.muted,false,"center"); text(s,r[2],930,y,180,46,18,C.muted,false,"center");});
  text(s,"Remplacez les valeurs par des mesures datées et comparables avant la présentation.",84,584,1110,42,17,C.orange);
}

// 13 — Q&A
{
  const s=deck.slides.add(); s.background.fill=C.green;
  s.images.add({blob:LOGO_BYTES,contentType:"image/png",fit:"contain",position:{left:1128,top:24,width:90,height:28}});
  text(s,"EN SYNTHÈSE",90,98,400,30,16,"#A7DEC7",true);
  text(s,"Une chaîne visible, reproductible et réversible",90,166,1040,96,43,"#FFFFFF",true);
  bullet(s,"Visible","Chaque livraison laisse une trace exploitable.",110,332,480,"#A7DEC7","#FFFFFF","#D9EEE4");
  bullet(s,"Reproductible","Le même processus s’applique à chaque version.",660,332,480,"#A7DEC7","#FFFFFF","#D9EEE4");
  bullet(s,"Réversible","Le rollback fait partie du scénario de livraison.",385,466,520,"#A7DEC7","#FFFFFF","#D9EEE4");
  text(s,"Questions ?",90,626,1080,48,25,"#FFFFFF",true,"center");
}

async function saveBlob(file, blob){ await fs.writeFile(file,new Uint8Array(await blob.arrayBuffer())); }
for (let i=0;i<deck.slides.items.length;i++) await saveBlob(path.join(tmpDir,`slide-${String(i+1).padStart(2,"0")}.png`),await deck.export({slide:deck.slides.getItem(i),format:"png",scale:1}));
await saveBlob(path.join(tmpDir,"montage.webp"),await deck.export({format:"webp",montage:true,scale:0.55}));
const candidate=path.join(tmpDir,"candidate.pptx"); await (await PresentationFile.exportPptx(deck)).save(candidate);

const SKILL_DIR="/Users/thomas-illiet/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills/presentations";
const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR,"container_tools/artifact_tool_utils.mjs")).href);
const finalPath=path.join(outDir,"Pipeline_VPIC_Theme_BNP_Paribas_v2.pptx");
await finalizePresentation({workspaceDir:path.resolve("."),candidatePath:candidate,finalPath,pythonExecutable:"/Users/thomas-illiet/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",integrityValidatorPath:path.join(SKILL_DIR,"container_tools/inspect_presentation_package_integrity.py"),layoutValidatorPath:path.join(SKILL_DIR,"container_tools/inspect_presentation_layout_geometry.py"),layoutArgs:["--expected-slide-size-emu","12192000,6858000","--validate-heading-fit"],explicitTotalSlideCount:13,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:"reference",families:[FONT],referencePath:"/Users/thomas-illiet/Documents/Codex/2026-11-03/dans-ce-repo-je-voudrais-que/outputs/Agentic-Platform-BNP-Paribas.pptx",referenceSha256:"a2f288ef124a5505f5c6b110db1c814a8dbf7ecf43471b6c64c4d5d3b5f89e40"},verifyArtifactToolImport:true,receiptPath:path.join(tmpDir,"validation-bnp-theme-v2.json")});
console.log(JSON.stringify({finalPath,slides:deck.slides.items.length,montage:path.join(tmpDir,"montage.webp")}));
