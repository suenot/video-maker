import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const bundle=process.env.ORDER_TYPES_RUNTIME_ROOT;
if(!bundle)throw new Error('Set ORDER_TYPES_RUNTIME_ROOT to the dependency root returned by Codex load_workspace_dependencies.');
const require=createRequire(`${bundle}/node/node_modules/@napi-rs/canvas/package.json`);
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const fonts=`${bundle}/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype`;
GlobalFonts.registerFromPath(`${fonts}/NotoSans-Regular.ttf`,'Blueprint');
GlobalFonts.registerFromPath(`${fonts}/NotoSans-Bold.ttf`,'Blueprint Bold');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputRoot=process.env.ORDER_TYPES_OUTPUT_ROOT||`${root}/output/algotrading-order-types`;
const evidenceRoot=process.env.ORDER_TYPES_EVIDENCE_ROOT||`${root}/temp/algotrading-order-types`;
fs.mkdirSync(evidenceRoot,{recursive:true});
const language=process.argv[2]||'en';
if(language!=='en')throw new Error('Russian frames require the reviewed actual Russian scene contract.');
const scenes=JSON.parse(fs.readFileSync(`${root}/storyboards/algotrading-order-types/semantic-scenes.en.json`,'utf8')).scenes;
const C={paper:'#F4F0E7',ink:'#24282D',blue:'#315F9B',red:'#C86452',line:'#CAC4B8'};
const evidence=[];

function makeFrame(vertical,scene,role='scene',sizeOverride=null){
  const width=sizeOverride?.[0]||(vertical?1080:1920),height=sizeOverride?.[1]||(vertical?1920:1080);
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
  const scale=sizeOverride?width/1920:1;
  if(scale!==1)ctx.scale(scale,scale);
  const bounds=vertical?{left:80,right:850,top:180,bottom:1430}:{left:120,right:1800,top:95,bottom:980};
  const placed=[],shapes=[];
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,width/scale,height/scale);
  function check(box,label){if(box.left<bounds.left||box.right>bounds.right||box.top<bounds.top||box.bottom>bounds.bottom)throw new Error(`${role}/${scene?.id}/${vertical}: outside safe area: ${label}`);}
  function text(value,x,y,maxWidth,size=vertical?38:42,bold=false,ink=C.ink){
    ctx.font=`${size}px "${bold?'Blueprint Bold':'Blueprint'}"`;ctx.fillStyle=ink;
    const lines=[];let line='';
    for(const word of value.split(' ')){
      const candidate=line?`${line} ${word}`:word;
      if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=word;}else line=candidate;
    }
    if(line)lines.push(line);
    let bottom=y;
    for(let i=0;i<lines.length;i++){
      const yy=y+i*size*1.35,metrics=ctx.measureText(lines[i]);
      const box={left:x,right:x+metrics.width,top:yy-metrics.actualBoundingBoxAscent,bottom:yy+metrics.actualBoundingBoxDescent};
      check(box,lines[i]);ctx.fillText(lines[i],x,yy);bottom=box.bottom;
      placed.push({text:lines[i],size,box});
    }
    return bottom;
  }
  function rect(x,y,w,h,ink=C.ink,fill=null){
    check({left:x-2,right:x+w+2,top:y-2,bottom:y+h+2},'rectangle');
    ctx.lineWidth=3;ctx.strokeStyle=ink;
    if(fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}ctx.strokeRect(x,y,w,h);
    shapes.push({kind:'rectangle',x,y,w,h});
  }
  function line(x1,y1,x2,y2,ink=C.line,dashed=false,arrow=false){
    check({left:Math.min(x1,x2)-3,right:Math.max(x1,x2)+3,top:Math.min(y1,y2)-3,bottom:Math.max(y1,y2)+3},'line');
    ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.setLineDash(dashed?[12,12]:[]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
    if(arrow){const a=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=ink;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-18*Math.cos(a-.45),y2-18*Math.sin(a-.45));ctx.lineTo(x2-18*Math.cos(a+.45),y2-18*Math.sin(a+.45));ctx.closePath();ctx.fill();}
    shapes.push({kind:'line',x1,y1,x2,y2,dashed,arrow});
  }
  function title(value){return text(value,vertical?90:130,vertical?245:180,vertical?750:1650,vertical?54:76,true);}
  function tokens(x,y,filled,cancelled,sz=vertical?54:64){
    for(let i=0;i<5;i++){
      const xx=x+i*(sz+12);rect(xx,y,sz,sz,i<filled?C.blue:C.ink,i<filled?C.blue:C.paper);
      if(cancelled&&i>=filled){line(xx+10,y+10,xx+sz-10,y+sz-10,C.red);line(xx+sz-10,y+10,xx+10,y+sz-10,C.red);}
    }
  }
  function server(x,y,blue=true){for(let i=0;i<3;i++){rect(x,y+i*35,120,26,blue?C.blue:C.ink);rect(x+12,y+8+i*35,10,10,blue?C.blue:C.ink,blue?C.blue:C.ink);}}
  function iocRow(x,y,w,kind){
    text(kind,x,y,w,vertical?62:64,true,C.blue);
    text(kind==='IOC'?'Immediate or Cancel':'Fill or Kill',x,y+(vertical?55:58),w,vertical?34:38);
    line(x,y+85,x+w,y+85);
    tokens(x,y+125,kind==='IOC'?2:0,true);
    text(kind==='IOC'?'Fill 2 / Cancel 3':'Fill 0 / Cancel 5',x,y+255,w,vertical?39:45,true,kind==='IOC'?C.blue:C.red);
    text(kind==='IOC'?'Partial fill allowed; cancel remainder':'Full quantity immediately or cancel',x,y+325,w,vertical?34:38);
  }

  if(role==='cover'||role==='thumbnail'){
    title('ORDER TYPES');
    text('Trigger / Price / Fill',vertical?90:130,vertical?430:320,vertical?750:1500,vertical?48:62,true,C.blue);
    const ys=vertical?[690,870,1050]:[555,555,555],xs=vertical?[90,90,90]:[130,720,1310];
    ['TRIGGER','PRICE','FILL'].forEach((s,i)=>{rect(xs[i],ys[i],vertical?750:480,120,C.blue);text(s,xs[i]+35,ys[i]+80,vertical?680:410,vertical?46:50,true);});
  }else if(role==='endcard'){
    text('marketmaker.cc',vertical?90:130,vertical?630:440,vertical?750:1650,vertical?72:115,true,C.blue);
    text('t.me/marketmaker_cc',vertical?90:130,vertical?875:675,vertical?750:1650,vertical?49:82);
  }else{
    const v=scene.visible_text;
    switch(scene.id){
      case 1:{
        title(v[3]);
        const ys=vertical?[515,795,1075]:[440,440,440],xs=vertical?[90,90,90]:[130,720,1310];
        for(let i=0;i<3;i++){
          rect(xs[i],ys[i],vertical?750:480,145,C.blue);
          text(v[i],xs[i]+25,ys[i]+90,vertical?700:430,vertical?43:44,true);
          if(i<2){
            if(vertical){line(465,ys[i]+160,465,ys[i]+240,C.blue,true,true);text('Conditional',540,ys[i]+215,300,32);}
            else {line(xs[i]+500,ys[i]+70,xs[i]+560,ys[i]+70,C.blue,true,true);text('Conditional',xs[i]+410,ys[i]+230,300,32);}
          }
        }
        break;
      }
      case 2:{
        title(v[0]);
        if(vertical){
          rect(90,450,750,200,C.blue);text(v[1],125,525,680,45,true);text(v[2],125,600,680,45,true);
          line(465,675,465,755,C.blue,false,true);text(v[3],90,840,750,43,true);
          for(let i=0;i<3;i++){rect(90,920+i*135,750,90,i===0?C.blue:C.red);text(v[4+i],125,985+i*135,680,40,true);}
        }else{
          rect(130,430,620,240,C.blue);text(v[1],165,515,550,50,true);text(v[2],165,600,550,50,true);
          line(780,550,995,550,C.blue,false,true);text(v[3],1080,395,670,52,true);
          for(let i=0;i<3;i++){rect(1080,440+i*145,670,100,i===0?C.blue:C.red);text(v[4+i],1115,510+i*145,600,43,true);}
        }break;
      }
      case 3:{
        if(vertical){
          title(v[0]);text(v[1],90,380,750,43,true,C.blue);
          for(let i=0;i<3;i++){rect(100+i*185,450+i*30,150,45,C.blue,C.blue);}line(735,445,735,610,C.blue,false,true);
          text(v[2],90,695,750,37,false,C.red);
          text(v[3],90,880,750,58,true);text(v[4],90,990,750,42,true,C.blue);line(95,1020,825,1020,C.blue);
          text(v[5],90,1135,750,42,true,C.blue);line(95,1170,825,1170,C.blue);text(v[6],90,1315,750,38,false,C.red);
        }else{
          title(v[0]);text(v[1],130,320,720,50,true,C.blue);
          for(let i=0;i<3;i++){rect(150+i*185,430+i*45,150,55,C.blue,C.blue);}line(780,425,780,690,C.blue,false,true);text(v[2],130,810,720,44,false,C.red);
          text(v[3],1030,180,720,76,true);text(v[4],1030,430,720,48,true,C.blue);line(1035,470,1740,470,C.blue);
          text(v[5],1030,660,720,48,true,C.blue);line(1035,700,1740,700,C.blue);text(v[6],1030,860,720,44,false,C.red);line(960,310,960,940);
        }break;
      }
      case 4:{
        title(v[0]);text('Illustrative: order 5, available 2',vertical?90:130,vertical?330:275,vertical?750:1600,vertical?32:42);
        if(vertical){iocRow(90,450,750,'IOC');iocRow(90,985,750,'FOK');}else{iocRow(130,405,720,'IOC');iocRow(1030,405,720,'FOK');line(960,385,960,935);}break;
      }
      case 5:{
        title(v[0]);text(v[1],vertical?90:130,vertical?410:300,vertical?750:1500,vertical?42:50,true,C.blue);
        if(vertical){rect(95,575,740,120,C.blue);text('Condition reached',130,655,670,42,true);line(465,715,465,885,C.blue,false,true);rect(95,905,740,120,C.blue);text('New order submitted',130,985,670,42,true);text(v[2],90,1255,750,40,true,C.red);}
        else{rect(135,490,650,160,C.blue);text('Condition reached',170,595,580,49,true);line(815,570,975,570,C.blue,false,true);rect(1015,490,730,160,C.blue);text('New order submitted',1050,595,660,49,true);text(v[2],130,855,1600,54,true,C.red);}break;
      }
      case 6:{
        text(v[6],vertical?90:130,vertical?235:150,vertical?750:1650,vertical?46:62,true,C.red);
        text('PRICE GAP',vertical?90:130,vertical?490:335,vertical?750:1500,vertical?34:42,true);
        if(vertical){line(705,450,735,475,C.red);line(735,475,705,500,C.red);line(705,500,735,525,C.red);line(760,515,825,540,C.red);line(825,540,825,940,C.red);line(825,560,750,560,C.red,false,true);line(825,940,750,940,C.red,false,true);}
        else{line(505,300,535,325,C.red);line(535,325,505,350,C.red);line(505,350,535,375,C.red);line(560,345,960,345,C.red);line(960,345,960,400,C.red);line(500,400,1400,400,C.red);line(500,400,500,425,C.red,false,true);line(1400,400,1400,425,C.red,false,true);}
        if(vertical){text(v[0],90,600,750,52,true,C.blue);text(v[1],90,675,750,36);text(v[2],90,750,750,35,false,C.red);line(95,905,825,905);text(v[3],90,1000,750,52,true,C.blue);text(v[4],90,1075,750,36);text(v[5],90,1150,750,35,false,C.red);}
        else {text(v[0],130,480,720,62,true,C.blue);text(v[1],130,570,720,42);text(v[2],130,705,720,43,false,C.red);text(v[3],1030,480,720,62,true,C.blue);text(v[4],1030,570,720,42);text(v[5],1030,705,720,43,false,C.red);line(960,430,960,945);}break;
      }
      case 7:{
        title(v[0]);text('Illustrative execution patterns',vertical?90:130,vertical?365:275,vertical?750:1600,vertical?32:38);
        if(vertical){text(v[1],90,475,750,62,true,C.blue);text(v[2],90,535,750,38);for(let i=0;i<4;i++)rect(100+i*165,600,110,90,C.blue,C.blue);text(v[3],90,850,750,62,true,C.blue);text(v[4],90,910,750,38);[55,105,150,85].forEach((h,i)=>rect(100+i*165,1110-h,110,h,C.blue,C.blue));text(v[5],90,1245,750,36,true);text(v[6],90,1385,750,34,true,C.red);}
        else{text(v[1],130,420,720,68,true,C.blue);text(v[2],130,495,720,44);for(let i=0;i<4;i++)rect(150+i*165,585,110,100,C.blue,C.blue);text(v[3],1030,420,720,68,true,C.blue);text(v[4],1030,495,720,44);[60,105,155,90].forEach((h,i)=>rect(1050+i*165,685-h,110,h,C.blue,C.blue));text(v[5],130,825,1600,48,true);text(v[6],130,925,1600,46,true,C.red);}break;
      }
      case 8:{
        title(v[0]);text(v[1],vertical?90:130,vertical?400:300,vertical?750:1600,vertical?58:64,true,C.blue);text(v[4],vertical?90:130,vertical?495:395,vertical?750:1600,vertical?38:44,false,C.red);
        if(vertical){text(v[2],90,650,750,44,true,C.blue);server(100,710);text(v[3],90,990,750,44,true);server(100,1050,false);text(v[5],90,1275,750,36);}
        else{text(v[2],130,550,720,49,true,C.blue);server(150,635);text(v[3],1030,550,720,49,true);server(1050,635,false);text(v[5],130,900,1600,44);line(960,480,960,810);}break;
      }
      case 9:{
        title(v[0]);for(let i=1;i<v.length;i++){const x=vertical?90:130,y=vertical?430+(i-1)*155:345+(i-1)*112;rect(x+4,y-34,32,32,C.blue);text(v[i],x+65,y,vertical?680:1500,vertical?38:49);}break;
      }
      case 10:{
        title(v[0]);text(v[1],vertical?90:130,vertical?490:330,vertical?750:1600,vertical?49:56,true,C.blue);
        const labels=['Request','Constraints','Observed outcome'];
        for(let i=0;i<3;i++){const x=vertical?95:135+i*590,y=vertical?650+i*165:485;rect(x,y,vertical?740:480,95,C.blue);text(labels[i],x+25,y+63,vertical?690:430,vertical?38:40,true);if(i<2){if(vertical)line(465,y+110,465,y+145,C.blue,true,true);else line(x+495,y+45,x+565,y+45,C.blue,true,true);}}
        text(v[2],vertical?90:130,vertical?1240:850,vertical?750:1600,vertical?49:60,true);break;
      }
      default:throw new Error(`Unsupported scene ${scene.id}`);
    }
  }
  const folder=`${outputRoot}/en/${vertical?'slides-shorts':'slides-desktop'}`;
  fs.mkdirSync(folder,{recursive:true});
  const name=role==='scene'?`slide_${String(scene.id).padStart(3,'0')}.png`:role==='thumbnail'?'thumbnail.png':`${role}.png`;
  const file=path.join(folder,name);
  fs.writeFileSync(file,canvas.toBuffer('image/png'));
  evidence.push({file,role,scene:scene?.id??null,width,height,bounds,scale,placed,shapes,geometry:'passed'});
}
for(const vertical of [false,true]){
  for(const scene of scenes)makeFrame(vertical,scene);
  makeFrame(vertical,null,'cover');makeFrame(vertical,null,'endcard');
}
makeFrame(false,null,'thumbnail',[1280,720]);
fs.writeFileSync(`${evidenceRoot}/en-native-frame-geometry.json`,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence.map(({file,width,height,geometry})=>({file,width,height,geometry}))));
