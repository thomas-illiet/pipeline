import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const W = 1280, H = 720;
const C = { white:"#FFFFFF", ink:"#123F32", green:"#00965E", deep:"#006B45", mint:"#E9F5EF", mint2:"#D7ECE1", lime:"#82D5B0", line:"#C7D9D0", muted:"#60756B", coral:"#D25562", blush:"#FBECEF", stone:"#F5F3EF" };
const FONT = "Arial";
const workspaceDir = path.resolve(".");
const outDir = path.join(workspaceDir,"output");
const tmpDir = path.join(workspaceDir,"build/.codex-premium-en-v2");
await fs.mkdir(outDir,{recursive:true}); await fs.mkdir(tmpDir,{recursive:true});
const logoBytes = await fs.readFile(path.join(workspaceDir,"build/reference-assets/image.png"));
const coverBytes = await fs.readFile(path.join(workspaceDir,"build/reference-assets/image3.png"));
const deck = Presentation.create({slideSize:{width:W,height:H}});

function shape(slide,geometry,x,y,w,h,fill="none",stroke="none",sw=0){return slide.shapes.add({geometry,position:{left:x,top:y,width:w,height:h},fill,line:{style:"solid",fill:stroke,width:sw}});}
function txt(slide,value,x,y,w,h,size=20,color=C.ink,bold=false,align="left"){const s=shape(slide,"textbox",x,y,w,h);s.text=value;s.text.style={fontFamily:FONT,fontSize:size,color,bold,alignment:align,verticalAlignment:"middle"};return s;}
function rule(slide,x,y,w,color=C.line,h=1){return shape(slide,"rect",x,y,w,h,color);}
function pill(slide,value,x,y,w,fill=C.green,color=C.white,size=16){const s=shape(slide,"roundRect",x,y,w,42,fill,fill);s.text=value;s.text.style={fontFamily:FONT,fontSize:size,bold:true,color,alignment:"center",verticalAlignment:"middle"};return s;}
function dot(slide,x,y,color=C.green,r=12){return shape(slide,"ellipse",x,y,r,r,color);}
function logo(slide,dark=false){if(dark)shape(slide,"rect",1120,18,104,39,C.white);slide.images.add({blob:logoBytes,contentType:"image/png",fit:"contain",position:{left:1124,top:23,width:94,height:30}});}
function chrome(slide,section,n,{dark=false,title,subtitle}={}){slide.background.fill=dark?C.deep:C.white;logo(slide,dark);txt(slide,section.toUpperCase(),64,30,650,24,14,dark?C.lime:C.green,true);txt(slide,String(n).padStart(2,"0"),1180,673,40,20,13,dark?C.white:C.ink,false,"right");if(title)txt(slide,title,64,76,1110,62,42,dark?C.white:C.ink,true);if(subtitle)txt(slide,subtitle,64,140,1080,42,20,dark?"#D9EEE4":C.muted);}
function arrow(slide,x,y,w=30,color=C.lime){shape(slide,"chevron",x,y,w,28,color);}

// 1 — Cover
{
 const s=deck.slides.add();s.background.fill=C.white;
 s.images.add({blob:logoBytes,contentType:"image/png",fit:"contain",position:{left:48,top:28,width:286,height:80}});
 s.images.add({blob:coverBytes,contentType:"image/png",fit:"cover",position:{left:660,top:0,width:620,height:720}});
 shape(s,"rect",640,0,20,720,C.green);txt(s,"The VPIC\npipeline",62,176,530,145,60,C.ink,true);rule(s,64,362,72,C.green,5);
 txt(s,"From bug fix\nto production deployment",62,395,520,94,27);pill(s,"CI / CD",62,530,140);
 txt(s,"Thomas Illiet",62,612,230,32,18,C.ink,true);txt(s,"50-minute presentation",266,612,300,32,18,C.muted);
}

// 2 — Agenda
{
 const s=deck.slides.add();s.background.fill=C.white;logo(s);txt(s,"INTRODUCTION",64,30,400,24,14,C.green,true);txt(s,"02",1180,673,40,20,13,C.ink,false,"right");
 shape(s,"rect",0,0,332,720,C.deep);txt(s,"50",62,120,200,110,86,C.white,true);txt(s,"minutes",66,224,190,42,24,C.lime,true);
 txt(s,"From context\nto live demo",66,320,220,96,24,C.white,true);txt(s,"Presentation flow",392,72,790,60,42,C.ink,true);
 const items=[["01","VPIC context","10 min"],["02","Pipeline and architecture","10 min"],["03","Demo","8 min"],["04","Results and benefits","3 min"],["05","Q&A","7 min"]];
 items.forEach((it,i)=>{const y=165+i*94;txt(s,it[0],396,y,56,40,22,C.green,true);txt(s,it[1],474,y,530,40,22,C.ink,true);txt(s,it[2],1040,y,120,40,17,C.muted,false,"right");if(i<4)rule(s,474,y+64,690);});
}

// 3 — VPIC overview
{
 const s=deck.slides.add();chrome(s,"VPIC context",3,{title:"VPIC in one minute",subtitle:"The business need, the user and the expected outcome"});
 txt(s,"What does\nthe application do?",68,220,360,116,38,C.green,true);txt(s,"State the business need addressed by VPIC in one direct sentence.",68,355,420,82,21);
 const stages=[["01","User","Who starts the workflow?"],["02","VPIC","What action does the application perform?"],["03","Outcome","What value does the business receive?"]];
 stages.forEach((st,i)=>{const x=548+i*220;dot(s,x,254,C.green,38);txt(s,st[0],x,254,38,38,16,C.white,true,"center");txt(s,st[1],x-18,312,190,34,23,C.ink,true);txt(s,st[2],x-18,350,190,70,16,C.muted);if(i<2)arrow(s,x+158,270,34);});
 shape(s,"roundRect",64,560,1120,70,C.mint,C.line,1);txt(s,"Complete before presenting",88,570,300,46,17,C.green,true);txt(s,"One sentence on the business problem and one on the value delivered",390,570,750,46,17);
}

// 4 — Before
{
 const s=deck.slides.add();chrome(s,"VPIC context",4,{title:"Before the pipeline",subtitle:"Four pain points limited delivery speed and reliability"});
 shape(s,"roundRect",64,208,300,382,C.deep,C.deep);txt(s,"4",94,248,180,110,88,C.white,true);txt(s,"operational\npain points",98,360,220,80,25,C.lime,true);txt(s,"The project baseline",98,500,210,52,17,"#D9EEE4");
 const rows=[["Deployment","Manual steps and reliance on a few people"],["Tests","Late execution and fragmented feedback"],["Traceability","Hard to link version, code and environment"],["Recovery","Slow or uncertain rollback after an incident"]];
 rows.forEach((r,i)=>{const y=210+i*96;txt(s,String(i+1),420,y,34,34,20,i===3?C.coral:C.green,true);txt(s,r[0],470,y,230,34,21,C.ink,true);txt(s,r[1],708,y,460,52,18,C.muted);if(i<3)rule(s,470,y+70,696);});
}

// 5 — Problems and expectations
{
 const s=deck.slides.add();chrome(s,"VPIC context",5,{title:"Challenges and team expectations",subtitle:"Each challenge maps to an operational expectation"});
 txt(s,"CHALLENGES",76,208,450,28,16,C.coral,true);txt(s,"TEAM EXPECTATIONS",706,208,470,28,16,C.green,true);shape(s,"rect",634,208,2,360,C.line);
 const pairs=[["Deployments were hard to reproduce","A standard path from commit to production"],["Defects were detected too late","Automated checks with clear results"],["Limited visibility into each release","A simple, documented rollback"]];
 pairs.forEach((p,i)=>{const y=266+i*110;dot(s,80,y+8,C.coral,14);txt(s,p[0],112,y,430,52,21,C.ink,true);arrow(s,606,y+8,30,C.line);dot(s,710,y+8,C.green,14);txt(s,p[1],742,y,430,52,21,C.ink,true);});
 txt(s,"Ground this slide in two or three real incidents",76,610,720,30,17,C.muted);
}

// 6 — Architecture
{
 const s=deck.slides.add();s.background.fill=C.mint;logo(s);txt(s,"PIPELINE AND ARCHITECTURE",64,30,600,24,14,C.green,true);txt(s,"06",1180,673,40,20,13,C.ink,false,"right");
 txt(s,"Pipeline architecture across 23 Kubernetes clusters",64,76,1100,62,42,C.ink,true);txt(s,"Jenkins builds any project and hands versioned artifacts to the deployment chain",64,140,1080,42,20,C.muted);
 const stages=[["Bitbucket","Source",C.deep,C.white],["Jenkins","Generic build",C.green,C.white],["Tests + Sonar","Quality",C.white,C.ink],["Artifactory","Artifacts",C.white,C.ink],["Argo CD","Deployment",C.deep,C.white],["Kubernetes","23 clusters",C.white,C.ink]];
 stages.forEach((st,i)=>{const x=60+i*202;txt(s,st[1],x,230,170,24,15,C.muted,false,"center");const b=shape(s,"roundRect",x,270,170,74,st[2],st[2]===C.white?C.line:st[2],1);b.text=st[0];b.text.style={fontFamily:FONT,fontSize:18,bold:true,color:st[3],alignment:"center",verticalAlignment:"middle"};if(i<5)arrow(s,x+176,293,22);});
 shape(s,"roundRect",190,424,900,100,C.white,C.line,1);txt(s,"CyberArk at deployment",220,442,300,50,20,C.green,true);txt(s,"The Argo CD plugin retrieves secrets and injects them into Helm values",516,434,530,68,17);
 txt(s,"Build outputs",64,582,120,30,16,C.green,true);txt(s,"Binary, archive or Docker image",190,582,300,30,16,C.ink,true);txt(s,"Artifactory",650,582,110,30,16,C.green,true);txt(s,"Separate Dev and Prod projects",766,582,360,30,16,C.ink,true);
}

// 7 — Build
{
 const s=deck.slides.add();chrome(s,"Pipeline and architecture",7,{title:"Build and compliance stages",subtitle:"The generic Jenkins pipeline validates any project before promotion"});
 shape(s,"roundRect",64,216,310,360,C.deep,C.deep);txt(s,"Promotion rule",94,244,230,32,18,C.lime,true);txt(s,"Failure blocks\npromotion",94,294,232,116,38,C.white,true);txt(s,"Unit tests and the 60% Quality Gate must pass.",94,442,230,90,18,"#D9EEE4");
 const stages=[["01","Checkout","Any project source"],["02","Unit tests","Coverage report"],["03","SonarQube","Gate requires at least 60% coverage"],["04","Package","Binary, archive or Docker image"],["05","Publish","Docker metadata and Artifactory"],["06","SBOM","Generated at pipeline end"]];
 stages.forEach((st,i)=>{const col=i%2,row=Math.floor(i/2),x=438+col*372,y=218+row*120;txt(s,st[0],x,y,48,34,19,C.green,true);txt(s,st[1],x+60,y,250,34,21,C.ink,true);txt(s,st[2],x+60,y+34,280,46,16,C.muted);if(row<2)rule(s,x+60,y+92,280);});
}

// 8 — Deploy
{
 const s=deck.slides.add();chrome(s,"Pipeline and architecture",8,{title:"Deployment across 23 clusters",subtitle:"Argo CD renders Helm releases with CyberArk secrets for each target environment"});
 shape(s,"roundRect",64,214,520,352,C.deep,C.deep);txt(s,"23",94,242,220,110,88,C.white,true);txt(s,"Kubernetes clusters",98,350,360,44,27,C.lime,true);txt(s,"Dedicated environments for Dev, Staging and Production",98,398,410,52,17,"#D9EEE4");
 const envs=[["DEV",C.lime,C.ink],["STAGING",C.green,C.white],["PRODUCTION",C.white,C.deep]];
 envs.forEach((e,i)=>{pill(s,e[0],92+i*154,480,136,e[1],e[2],16);});
 shape(s,"rect",638,202,2,382,C.line);txt(s,"DEPLOYMENT PATH",700,218,420,28,16,C.green,true);
 const guards=[["1","Argo CD","Synchronizes the declared Helm release",C.deep],["2","CyberArk plugin","Retrieves deployment secrets from CyberArk",C.green],["3","Helm values","Receive the secrets before deployment",C.coral]];
 guards.forEach((g,i)=>{const y=276+i*108;dot(s,700,y+5,g[3],30);txt(s,g[0],700,y+5,30,30,14,C.white,true,"center");txt(s,g[1],748,y,360,30,20,C.ink,true);txt(s,g[2],748,y+34,420,46,16,C.muted);});
}

// 9 — Versioning
{
 const s=deck.slides.add();chrome(s,"Pipeline and architecture",9,{title:"Artifact promotion strategy",subtitle:"Jenkins moves the same build from Dev to Prod without rebuilding it"});
 const nodes=[["Jenkins build",C.mint,C.ink],["Promote to Dev",C.mint,C.ink],["Dev Artifactory",C.green,C.white],["Promote Prod",C.mint,C.ink],["Prod Artifactory",C.deep,C.white]];
 nodes.forEach((n,i)=>{const x=76+i*224;const b=shape(s,"roundRect",x,270,178,60,n[1],n[1]===C.mint?C.line:n[1],1);b.text=n[0];b.text.style={fontFamily:FONT,fontSize:18,bold:true,color:n[2],alignment:"center",verticalAlignment:"middle"};if(i<4)arrow(s,x+184,286,28);});
 rule(s,165,382,810,C.line,2);dot(s,156,374,C.green,18);dot(s,964,374,C.deep,18);txt(s,"Build once",76,410,250,30,16,C.muted);txt(s,"Same version in production",910,410,272,30,16,C.muted,false,"right");
 shape(s,"roundRect",310,492,660,104,C.mint,C.line,1);txt(s,"Immutable release package",338,506,604,28,17,C.green,true,"center");txt(s,"Version, Docker metadata and SBOM stay linked to the promoted artifacts",338,540,604,40,16,C.ink,false,"center");
}

// 10 — Demo
{
 const s=deck.slides.add();chrome(s,"Video demo",10,{title:"From bug report to production",subtitle:"Follow one artifact through Jenkins promotion and Argo CD synchronization"});
 shape(s,"roundRect",64,214,520,350,C.deep,C.deep);shape(s,"ellipse",254,322,90,90,C.white);shape(s,"chevron",286,350,38,30,C.green);
 txt(s,"VIDEO",84,238,120,28,15,C.lime,true);txt(s,"8 minutes",84,500,200,34,23,C.white,true);
 txt(s,"Bug fix, gated build and explicit promotions",624,218,520,52,22,C.ink,true);
 const steps=["Bug reported","Fix and pull request","Merge to main","Jenkins build + 60% gate","Promote to Dev","Promote Prod"];
 steps.forEach((st,i)=>{const y=294+i*48;dot(s,628,y+7,i===5?C.deep:C.green,20);txt(s,String(i+1),628,y+7,20,20,12,C.white,true,"center");txt(s,st,664,y,440,32,18,C.ink,i===5);if(i<5)rule(s,638,y+28,2,C.line,20);});
 txt(s,"Call out",624,582,140,32,15,C.green,true);txt(s,"Unit tests, SBOM, Artifactory targets, Argo CD sync and CyberArk",772,574,400,48,15,C.muted);
}

// 11 — Rollback
{
 const s=deck.slides.add();chrome(s,"Video demo",11,{dark:true,title:"Rollback rehearsal",subtitle:"Bonus scenario: return to a previous promoted artifact without rebuilding it"});
 const stages=[["01","Version N",C.green],["02","Incident",C.coral],["03","Previous version",C.lime],["04","Service restored",C.white]];
 stages.forEach((st,i)=>{const x=72+i*294;dot(s,x,268,st[2],58);txt(s,st[0],x,268,58,58,16,i===3?C.deep:C.white,true,"center");txt(s,st[1],x-4,348,220,40,22,C.white,true);if(i<3){rule(s,x+72,296,190,"#78A996",2);arrow(s,x+244,282,28,"#78A996");}});
 shape(s,"roundRect",74,488,1130,92,"#075A3D","#2D8061",1);txt(s,"Goal",98,505,110,44,17,C.lime,true);txt(s,"Confirm the exact Jenkins and Argo CD actions before recording",220,505,880,44,20,C.white,true);
}

// 12 — Gains
{
 const s=deck.slides.add();chrome(s,"Results and benefits",12,{title:"Measure before and after",subtitle:"Four indicators are enough to quantify the improvement"});
 shape(s,"roundRect",64,214,316,382,C.deep,C.deep);txt(s,"4",92,246,160,100,86,C.white,true);txt(s,"indicators\nto document",96,350,230,80,25,C.lime,true);txt(s,"Dated, comparable values",96,490,230,60,17,"#D9EEE4");
 txt(s,"INDICATOR",444,212,300,28,15,C.muted,true);txt(s,"BEFORE",850,212,120,28,15,C.coral,true,"center");txt(s,"AFTER",1040,212,120,28,15,C.green,true,"center");
 const rows=["Deployment lead time","Deployment frequency","Time to restore service","Change failure rate"];
 rows.forEach((r,i)=>{const y=258+i*76;if(i%2===0)shape(s,"rect",424,y-8,760,62,C.mint);txt(s,r,444,y,360,44,19,C.ink,true);txt(s,"To measure",846,y,130,44,17,C.muted,false,"center");txt(s,"To measure",1034,y,130,44,17,C.muted,false,"center");});
 txt(s,"Replace placeholders before presenting",444,580,660,28,16,C.green,true);
}

// 13 — Closing
{
 const s=deck.slides.add();s.background.fill=C.deep;logo(s,true);txt(s,"13",1180,673,40,20,13,C.white,false,"right");
 txt(s,"Questions?",64,112,600,100,62,C.white,true);rule(s,66,236,76,C.lime,5);txt(s,"The pipeline in three ideas",64,286,420,38,19,C.lime,true);
 const ideas=[["Build once","One Jenkins pipeline builds any project"],["Promote unchanged","The same artifact moves from Dev to Prod"],["Deploy securely","Argo CD uses CyberArk secrets across 23 clusters"]];
 ideas.forEach((it,i)=>{const x=64+i*390;txt(s,String(i+1).padStart(2,"0"),x,374,54,34,20,C.lime,true);txt(s,it[0],x,418,300,38,23,C.white,true);txt(s,it[1],x,466,330,62,17,"#D9EEE4");});
 txt(s,"Thomas Illiet",64,626,240,28,17,C.white,true);
}

async function saveBlob(file,blob){await fs.writeFile(file,new Uint8Array(await blob.arrayBuffer()));}
for(let i=0;i<deck.slides.items.length;i++)await saveBlob(path.join(tmpDir,`slide-${String(i+1).padStart(2,"0")}.png`),await deck.export({slide:deck.slides.getItem(i),format:"png",scale:1}));
await saveBlob(path.join(tmpDir,"montage.webp"),await deck.export({format:"webp",montage:true,scale:0.55}));
const candidatePath=path.join(tmpDir,"candidate-premium-en-v2.pptx");await(await PresentationFile.exportPptx(deck)).save(candidatePath);
const SKILL_DIR="/Users/thomas-illiet/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11011/skills/presentations";
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL_DIR,"container_tools/artifact_tool_utils.mjs")).href);
const finalPath=path.join(outDir,"VPIC_Pipeline_BNP_Paribas_Premium_EN_v2.pptx");
await finalizePresentation({workspaceDir,candidatePath,finalPath,pythonExecutable:"/Users/thomas-illiet/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",integrityValidatorPath:path.join(SKILL_DIR,"container_tools/inspect_presentation_package_integrity.py"),layoutValidatorPath:path.join(SKILL_DIR,"container_tools/inspect_presentation_layout_geometry.py"),layoutArgs:["--expected-slide-size-emu","12192000,6858000","--validate-heading-fit"],explicitTotalSlideCount:13,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:"reference",families:[FONT],referencePath:"/Users/thomas-illiet/Documents/Codex/2026-11-03/dans-ce-repo-je-voudrais-que/outputs/Agentic-Platform-BNP-Paribas.pptx",referenceSha256:"a2f288ef124a5505f5c6b110db1c814a8dbf7ecf43471b6c64c4d5d3b5f89e40"},verifyArtifactToolImport:true,receiptPath:path.join(tmpDir,"validation-premium-en-v2.json")});
console.log(JSON.stringify({finalPath,slides:deck.slides.items.length,montage:path.join(tmpDir,"montage.webp")}));
