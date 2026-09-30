import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const bundle=process.env.ORDER_TYPES_RUNTIME_ROOT;
if(!bundle)throw new Error('Set ORDER_TYPES_RUNTIME_ROOT to the dependency root returned by Codex load_workspace_dependencies.');
const require=createRequire(`${bundle}/node/node_modules/@napi-rs/canvas/package.json`);
const {createCanvas,GlobalFonts,loadImage}=require('@napi-rs/canvas');
const fonts=`${bundle}/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype`;
GlobalFonts.registerFromPath(`${fonts}/NotoSans-Regular.ttf`,'Blueprint');
GlobalFonts.registerFromPath(`${fonts}/NotoSans-Bold.ttf`,'Blueprint Bold');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputRoot=process.env.ORDER_TYPES_OUTPUT_ROOT||`${root}/output/algotrading-order-types`;
const evidenceRoot=process.env.ORDER_TYPES_EVIDENCE_ROOT||`${root}/temp/algotrading-order-types`;
fs.mkdirSync(evidenceRoot,{recursive:true});
const slug='algotrading-order-types';
const contract=JSON.parse(fs.readFileSync(`${root}/storyboards/${slug}/semantic-scenes.ru.json`,'utf8'));
const C={paper:'#F4F0E7',ink:'#24282D',blue:'#315F9B',red:'#C86452',line:'#CAC4B8'};
const evidence=[];

function frame(aspect,scene,role='scene'){
  const vertical=aspect==='shorts';
  const width=vertical?1080:1920,height=vertical?1920:1080;
  const safe=vertical?{left:80,right:850,top:180,bottom:1430}:{left:120,right:1800,top:95,bottom:980};
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
  const placed=[],shapes=[];
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,width,height);
  const assert=(b,label)=>{if(b.left<safe.left||b.right>safe.right||b.top<safe.top||b.bottom>safe.bottom)throw new Error(`${aspect}/${role}/${scene?.id}: ${label} outside safe zone ${JSON.stringify(b)}`);};
  function linesFor(value,maxWidth,size,bold){
    ctx.font=`${size}px "${bold?'Blueprint Bold':'Blueprint'}"`;
    const out=[];let line='';
    for(const word of value.split(/\s+/)){
      const next=line?`${line} ${word}`:word;
      if(line&&ctx.measureText(next).width>maxWidth){out.push(line);line=word;}else line=next;
    }
    if(line)out.push(line);
    return out;
  }
  function text(value,x,top,maxWidth,size=vertical?38:43,bold=false,color=C.ink,maxBottom=safe.bottom){
    if(size<32)throw new Error('type under 32 px');
    ctx.font=`${size}px "${bold?'Blueprint Bold':'Blueprint'}"`;
    ctx.fillStyle=color;
    const lines=linesFor(value,maxWidth,size,bold),step=Math.ceil(size*1.3);
    for(let i=0;i<lines.length;i++){
      const baseline=top+size+i*step,measure=ctx.measureText(lines[i]);
      const box={left:x,right:x+measure.width,top:baseline-measure.actualBoundingBoxAscent,bottom:baseline+measure.actualBoundingBoxDescent};
      assert(box,`text ${lines[i]}`);
      if(box.bottom>maxBottom)throw new Error(`${value}: text beyond intended panel ${box.bottom}>${maxBottom}`);
      ctx.fillText(lines[i],x,baseline);placed.push({text:lines[i],font_size:size,box});
    }
    return top+size+(lines.length-1)*step;
  }
  function rect(x,y,w,h,color=C.blue,fill=null){
    const box={left:x,right:x+w,top:y,bottom:y+h};assert(box,'rectangle');
    ctx.lineWidth=3;ctx.strokeStyle=color;
    if(fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}ctx.strokeRect(x,y,w,h);
    shapes.push({kind:'rectangle',box});
  }
  function line(x1,y1,x2,y2,color=C.blue,arrow=false,dashed=false){
    assert({left:Math.min(x1,x2),right:Math.max(x1,x2),top:Math.min(y1,y2),bottom:Math.max(y1,y2)},'line');
    ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash(dashed?[12,10]:[]);ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
    if(arrow){const a=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-17*Math.cos(a-.45),y2-17*Math.sin(a-.45));ctx.lineTo(x2-17*Math.cos(a+.45),y2-17*Math.sin(a+.45));ctx.fill();}
    shapes.push({kind:'line',x1,y1,x2,y2,arrow,dashed});
  }
  function title(value){text(value,vertical?90:130,vertical?205:115,vertical?750:1630,vertical?49:70,true,C.ink,vertical?360:275);line(vertical?90:130,vertical?347:282,vertical?840:1780,vertical?347:282,C.line);}
  function panel(x,y,w,h,items,color=C.blue,fill=null){
    rect(x,y,w,h,color,fill);
    let yy=y+(vertical?17:22);
    for(let i=0;i<items.length;i++){
      const it=items[i],size=it.size||(i===0?(vertical?42:51):(vertical?35:40));
      const bottom=text(it.value,x+25,yy,w-50,size,i===0||!!it.bold,it.color||((i===0)?color:C.ink),y+h-15);
      yy=bottom+(it.gap??(vertical?23:24));
    }
  }
  function twoGroups(a,b){
    if(vertical){panel(90,395,750,a.h,a.items);panel(90,395+a.h+25,750,b.h,b.items,b.color||C.blue);}
    else{panel(130,355,785,570,a.items);panel(985,355,785,570,b.items,b.color||C.blue);}
  }
  const v=scene?.visible_text;
  if(role==='cover'){
    const copy=contract.cover.visible_text;title(copy[0]);
    if(vertical){copy.slice(1).forEach((s,i)=>panel(90,460+i*270,750,160,[{value:s,size:55}]));}
    else{copy.slice(1).forEach((s,i)=>panel(130+i*555,485,500,200,[{value:s,size:58}]));}
  }else if(role==='endcard'){
    text(contract.endcard.contacts[0],vertical?90:130,vertical?555:395,vertical?750:1600,vertical?70:105,true,C.blue);
    text(contract.endcard.contacts[1],vertical?90:130,vertical?825:635,vertical?750:1600,vertical?48:76,false,C.ink);
  }else{
    title(v[0]);
    switch(scene.id){
      case 1:
        if(vertical){v.slice(1,4).forEach((s,i)=>{panel(90,405+i*225,750,135,[{value:s,size:43}]);if(i<2)line(465,545+i*225,465,620+i*225,C.blue,true,true);});text(scene.diagram_annotations[0],545,630,280,32,false,C.blue);panel(90,1135,750,185,[{value:v[4],size:42,color:C.red}],C.red);}
        else{v.slice(1,4).forEach((s,i)=>{panel(130+i*555,420,500,170,[{value:s,size:48}]);if(i<2)line(640+i*555,505,675+i*555,505,C.blue,true,true);});text(scene.diagram_annotations[0],780,630,350,35,false,C.blue);panel(335,735,1250,160,[{value:v[4],size:53,color:C.red}],C.red);}break;
      case 2:
        twoGroups({h:390,items:[{value:v[1]},{value:v[2]},{value:v[3],color:C.red}]},{h:430,items:[{value:v[4]},{value:v[5]},{value:v[6]}]});break;
      case 3:
        if(vertical){panel(90,430,750,210,[{value:v[1],size:45}]);panel(90,705,750,210,[{value:v[2],size:45}]);panel(90,1000,750,220,[{value:v[3],size:40,color:C.red}],C.red);}
        else{panel(130,405,785,280,[{value:v[1],size:51}]);panel(985,405,785,280,[{value:v[2],size:51}]);panel(390,770,1140,140,[{value:v[3],size:49,color:C.red}],C.red);}break;
      case 4:
        if(vertical){text(v[5],90,370,750,33,false,C.ink);panel(90,450,750,375,[{value:v[1],size:42},{value:v[2],size:35},{value:scene.diagram_annotations[0],size:34,color:C.blue}]);panel(90,855,750,375,[{value:v[3],size:42},{value:v[4],size:35},{value:scene.diagram_annotations[1],size:34,color:C.red}],C.red);}
        else{text(v[5],130,330,1500,38,false,C.ink);panel(130,420,785,460,[{value:v[1],size:45},{value:v[2],size:43},{value:scene.diagram_annotations[0],size:39,color:C.blue}]);panel(985,420,785,460,[{value:v[3],size:45},{value:v[4],size:43},{value:scene.diagram_annotations[1],size:39,color:C.red}],C.red);}break;
      case 5:
        if(vertical){
          panel(90,420,750,155,[{value:v[2],size:42}]);
          text(scene.diagram_annotations[0],90,620,750,32,false,C.blue);
          panel(90,685,750,155,[{value:v[1],size:42}]);
          text(scene.diagram_annotations[1],90,875,750,32,false,C.red);
          panel(90,940,750,155,[{value:v[3],size:40,color:C.red}],C.red);
          panel(90,1190,750,155,[{value:v[4],size:38,color:C.red}],C.red);
        }else{
          panel(610,380,700,145,[{value:v[2],size:48}]);
          line(960,530,960,575,C.line);line(520,575,1370,575,C.line);
          text(scene.diagram_annotations[0],200,590,650,36,false,C.blue);
          text(scene.diagram_annotations[1],1070,590,650,36,false,C.red);
          line(520,575,520,640,C.blue,true);line(1370,575,1370,640,C.red,true);
          panel(130,655,785,150,[{value:v[1],size:47}]);
          panel(985,655,785,150,[{value:v[3],size:45,color:C.red}],C.red);
          text(v[4],450,865,1300,48,true,C.red);
        }break;
      case 6:
        if(vertical){v.slice(1).forEach((s,i)=>{panel(90,430+i*235,750,155,[{value:s,size:i===3?39:43,color:i===3?C.red:C.blue}],i===3?C.red:C.blue);if(i<2)line(465,590+i*235,465,655+i*235,C.blue,true);});}
        else{v.slice(1).forEach((s,i)=>{panel(130+i*417,440,370,195,[{value:s,size:i===3?37:42,color:i===3?C.red:C.blue}],i===3?C.red:C.blue);if(i<3)line(505+i*417,540,540+i*417,540,C.blue,true);});}break;
      case 7:
        if(vertical){text(scene.diagram_annotations[0],90,365,750,32,false,C.red);panel(90,445,750,330,[{value:v[1],size:39},{value:v[2],size:37},{value:v[3],size:34,color:C.red}]);panel(90,805,750,330,[{value:v[4],size:39},{value:v[5],size:37},{value:v[6],size:34,color:C.red}],C.red);text(v[7],90,1220,750,37,true,C.red);}
        else{text(scene.diagram_annotations[0],130,330,1500,36,false,C.red);panel(130,410,785,420,[{value:v[1],size:48},{value:v[2],size:43},{value:v[3],size:39,color:C.red}]);panel(985,410,785,420,[{value:v[4],size:48},{value:v[5],size:43},{value:v[6],size:39,color:C.red}],C.red);text(v[7],245,875,1500,51,true,C.red);}break;
      case 8:
        if(vertical){text(scene.diagram_annotations[0],90,365,750,32,false,C.ink);panel(90,440,750,260,[{value:v[1],size:51},{value:v[2],size:39}]);panel(90,770,750,260,[{value:v[3],size:51},{value:v[4],size:39}]);for(let i=0;i<4;i++){const h=[65,110,145,95][i];rect(130+i*165,1220-h,100,h,C.blue,C.blue);}text(v[5],90,1280,750,38,true,C.red);}
        else{text(scene.diagram_annotations[0],130,330,1500,36,false,C.ink);panel(130,420,785,340,[{value:v[1],size:56},{value:v[2],size:46}]);panel(985,420,785,340,[{value:v[3],size:56},{value:v[4],size:46}]);for(let i=0;i<4;i++){rect(1050+i*160,820-[55,95,140,75][i],95,[55,95,140,75][i],C.blue,C.blue);}text(v[5],425,875,1200,54,true,C.red);}break;
      case 9:
        if(vertical){text(v[1],90,365,750,38,true,C.blue);panel(90,480,750,340,[{value:v[2],size:42},{value:v[4],size:35}]);panel(90,860,750,340,[{value:v[3],size:42},{value:v[5],size:35}],C.red);}
        else{text(v[1],130,340,1500,46,true,C.blue);panel(130,450,785,400,[{value:v[2],size:50},{value:v[4],size:42}]);panel(985,450,785,400,[{value:v[3],size:50},{value:v[5],size:42}],C.red);}break;
      case 10:
        if(vertical){panel(90,450,750,220,[{value:v[1],size:38,color:C.red}],C.red);panel(90,735,750,250,[{value:v[2],size:37}]);panel(90,1100,750,205,[{value:v[3],size:38,color:C.red}],C.red);}
        else{panel(130,420,785,350,[{value:v[1],size:48,color:C.red}],C.red);panel(985,420,785,350,[{value:v[2],size:47}]);text(v[3],400,850,1300,50,true,C.red);}break;
      case 11:
        if(vertical){v.slice(1).forEach((s,i)=>panel(90,425+i*225,750,160,[{value:s,size:42}]));}
        else{v.slice(1).forEach((s,i)=>panel(130+(i%2)*855,405+Math.floor(i/2)*260,785,205,[{value:s,size:49}]));}break;
      case 12:
        if(vertical){v.slice(1).forEach((s,i)=>panel(90,420+i*225,750,i===3?190:160,[{value:s,size:i===3?35:39,color:i===3?C.red:C.blue}],i===3?C.red:C.blue));}
        else{v.slice(1).forEach((s,i)=>panel(130+(i%2)*855,400+Math.floor(i/2)*265,785,215,[{value:s,size:i===3?37:45,color:i===3?C.red:C.blue}],i===3?C.red:C.blue));}break;
      default:throw new Error(`Unknown RU scene ${scene.id}`);
    }
  }
  const dir=`${outputRoot}/ru/slides-${aspect}`;fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,role==='scene'?`slide_${String(scene.id).padStart(3,'0')}.png`:`${role}.png`);
  fs.writeFileSync(file,canvas.toBuffer('image/png'));
  evidence.push({file,aspect,role,scene_id:scene?.id??null,width,height,safe,placed,shapes,geometry:'passed'});
  return file;
}

for(const aspect of ['desktop','shorts']){
  for(const scene of contract.scenes)frame(aspect,scene);
  frame(aspect,null,'cover');frame(aspect,null,'endcard');
}
const source=await loadImage(`${outputRoot}/ru/slides-desktop/cover.png`);
const thumb=createCanvas(1280,720);thumb.getContext('2d').drawImage(source,0,0,1280,720);
const thumbnail=`${outputRoot}/ru/thumbnail.png`;fs.writeFileSync(thumbnail,thumb.toBuffer('image/png'));
fs.writeFileSync(`${evidenceRoot}/ru-native-frame-geometry.json`,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({frames:evidence.length,thumbnail,geometry:'passed'}));
