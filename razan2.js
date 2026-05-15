
var svcs={};
var sigDrawing=false,sigHasData=false;
var prices={ship:115,c1:460,c2:1725,copy:11.5,trans:23,grad:23,eng:23,wes:23,ver:23,cust:115};
var svcIds=Object.keys(prices);
 
// ── Org toggle ──
function toggleOrg(){
  var cb=document.getElementById('isOrg');
  var sec=document.getElementById('orgSec');
  var card=document.getElementById('tcCard');
  cb.checked=!cb.checked;
  sec.classList.toggle('open',cb.checked);
  card.classList.toggle('on',cb.checked);
}
document.getElementById('isOrg').addEventListener('change',function(){
  var sec=document.getElementById('orgSec');
  var card=document.getElementById('tcCard');
  sec.classList.toggle('open',this.checked);
  card.classList.toggle('on',this.checked);
});
 
// ── Services ──
function toggleSvc(id,row){
  var cb=document.getElementById('c-'+id);
  cb.checked=!cb.checked;
  var qty=document.getElementById('q-'+id);
  svcs[id]=cb.checked;
  qty.disabled=!cb.checked;
  row.classList.toggle('picked',cb.checked);
  calcTot();
  // Show/hide address section
  var addrFields=document.getElementById('addr-fields');
  var addrInfo=document.getElementById('addr-info');
  if(id==='ship'){
    addrFields.style.display=cb.checked?'block':'none';
    addrInfo.style.display=cb.checked?'none':'flex';
    if(cb.checked)document.getElementById('addr-card').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}
 
function calcTot(){
  var sub=0;
  svcIds.forEach(function(id){
    if(svcs[id]){
      var q=parseFloat((document.getElementById('q-'+id)||{}).value)||1;
      sub+=prices[id]*q;
    }
  });
  var vat=sub*0.15,tot=sub+vat;
  document.getElementById('t-sub').textContent=sub.toFixed(2)+' ر.س';
  document.getElementById('t-vat').textContent=vat.toFixed(2)+' ر.س';
  document.getElementById('t-tot').textContent=tot.toFixed(2)+' ر.س';
  document.getElementById('pay-amt').textContent=tot.toFixed(2);
  document.getElementById('sb-amt').textContent=tot.toFixed(2)+' ر.س';
  // Show sticky bar if any service selected
  var bar=document.getElementById('stickyBar');
  bar.classList.toggle('visible',tot>0);
}
 
// ── Agree ──
function toggleAgree(){
  var cb=document.getElementById('agreeChk');
  cb.checked=!cb.checked;
  document.getElementById('agreeRow').classList.toggle('checked',cb.checked);
  document.getElementById('e-agree').classList.toggle('show',!cb.checked);
}
document.getElementById('agreeChk').addEventListener('change',function(){
  document.getElementById('agreeRow').classList.toggle('checked',this.checked);
  document.getElementById('e-agree').classList.toggle('show',!this.checked);
});
 
// ── File upload ──
function pickFile(input,zoneId,fnId){
  var zone=document.getElementById(zoneId);
  var fname=document.getElementById(fnId);
  if(input.files&&input.files.length){
    var names=Array.from(input.files).map(function(f){return f.name}).join(', ');
    fname.textContent='✓ '+names;
    zone.classList.add('filled');
    if(zoneId==='uz-id')document.getElementById('e-idfile').classList.remove('show');
  }
}
 
// ── Card formatting ──
function fmtCard(inp){
  var v=inp.value.replace(/\\D/g,'').substring(0,16);
  inp.value=v.match(/.{1,4}/g)?.join(' ')||v;
  document.getElementById('cv-num').textContent=inp.value||'•••• •••• •••• ••••';
}
function fmtExp(inp){
  var v=inp.value.replace(/\\D/g,'').substring(0,4);
  if(v.length>=2)v=v.substring(0,2)+'/'+v.substring(2);
  inp.value=v;
  document.getElementById('cv-exp').textContent=v||'MM / YY';
}
 
// ── Signature ──
function initSig(){
  var c=document.getElementById('sigCanvas');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.strokeStyle='#0b1f3a';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';
  function pos(e){
    var r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height;
    if(e.touches)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};
    return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};
  }
  c.addEventListener('mousedown',function(e){sigDrawing=true;ctx.beginPath();var p=pos(e);ctx.moveTo(p.x,p.y)});
  c.addEventListener('mousemove',function(e){if(!sigDrawing)return;var p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();sigHasData=true});
  c.addEventListener('mouseup',function(){sigDrawing=false});
  c.addEventListener('mouseleave',function(){sigDrawing=false});
  c.addEventListener('touchstart',function(e){e.preventDefault();sigDrawing=true;ctx.beginPath();var p=pos(e);ctx.moveTo(p.x,p.y)},{passive:false});
  c.addEventListener('touchmove',function(e){e.preventDefault();if(!sigDrawing)return;var p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();sigHasData=true},{passive:false});
  c.addEventListener('touchend',function(){sigDrawing=false});
  function resize(){var w=c.parentElement.offsetWidth;c.style.width=w+'px';c.style.height='130px';}
  resize();window.addEventListener('resize',resize);
}
function clearSig(){
  var c=document.getElementById('sigCanvas');
  c.getContext('2d').clearRect(0,0,c.width,c.height);
  sigHasData=false;
}
 
// ── Validation ──
function errSet(id,show){
  var e=document.getElementById('e-'+id);
  var i=document.getElementById('f-'+id);
  if(e)e.classList.toggle('show',show);
  if(i)i.classList.toggle('err',show);
}
 
function validateAll(){
  var ok=true;
  // Section 1
  ['name','sid','id','col','prog','yr','email','phone'].forEach(function(f){
    var v=(document.getElementById('f-'+f)||{}).value||'';
    if(!v.trim()){errSet(f,true);ok=false;}else errSet(f,false);
  });
  var em=document.getElementById('f-email').value;
  if(em&&!/\\S+@\\S+\\.\\S+/.test(em)){errSet('email',true);ok=false;}
  var ph=document.getElementById('f-phone').value;
  if(ph&&!/^05\\d{8}$/.test(ph)){errSet('phone',true);ok=false;}
  // Section 3
  if(!Object.values(svcs).some(Boolean)){alert('يُرجى اختيار خدمة واحدة على الأقل');ok=false;}
  // Section 4
  if(!document.getElementById('uz-id').classList.contains('filled')){
    document.getElementById('e-idfile').classList.add('show');ok=false;
  }
  // Section 5 (if shipping selected)
  if(svcs['ship']){
    ['aname','acity','adist','aphone'].forEach(function(f){
      var v=(document.getElementById('f-'+f)||{}).value||'';
      if(!v.trim()){errSet(f,true);ok=false;}else errSet(f,false);
    });
  }
  // Section 6
  if(!document.getElementById('agreeChk').checked){
    document.getElementById('e-agree').classList.add('show');ok=false;
  }
  ['pname','pdate'].forEach(function(f){
    var v=(document.getElementById('f-'+f)||{}).value||'';
    errSet(f,!v.trim());if(!v.trim())ok=false;
  });
  if(!sigHasData){document.getElementById('e-sig').classList.add('show');ok=false;}
  else document.getElementById('e-sig').classList.remove('show');
  // Section 7
  ['cname','cnum','cexp','cvv'].forEach(function(f){
    var v=(document.getElementById('f-'+f)||{}).value||'';
    errSet(f,!v.trim());if(!v.trim())ok=false;
  });
  var cn=document.getElementById('f-cnum').value.replace(/\\s/g,'');
  if(cn&&cn.length!==16){errSet('cnum',true);ok=false;}
  return ok;
}
 
// ── Submit ──
function submitForm(){
  if(!validateAll()){
    // Scroll to first error
    var first=document.querySelector('.errmsg.show,.finput.err');
    if(first)first.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  var ref='DGS-'+new Date().getFullYear()+'-'+Math.floor(10000+Math.random()*90000);
  document.getElementById('refNum').textContent=ref;
  document.getElementById('successOverlay').classList.add('show');
}
 
function closeSuccess(){
  document.getElementById('successOverlay').classList.remove('show');
  // Reset form
  document.querySelectorAll('.finput').forEach(function(el){el.value='';el.classList.remove('err')});
  document.querySelectorAll('.errmsg').forEach(function(el){el.classList.remove('show')});
  document.querySelectorAll('.svc-row').forEach(function(r){r.classList.remove('picked')});
  svcIds.forEach(function(id){
    var cb=document.getElementById('c-'+id),q=document.getElementById('q-'+id);
    if(cb)cb.checked=false;if(q)q.disabled=true;
  });
  svcs={};calcTot();clearSig();
  document.getElementById('agreeChk').checked=false;
  document.getElementById('agreeRow').classList.remove('checked');
  document.getElementById('isOrg').checked=false;
  document.getElementById('orgSec').classList.remove('open');
  document.getElementById('tcCard').classList.remove('on');
  document.getElementById('addr-fields').style.display='none';
  document.getElementById('addr-info').style.display='flex';
  document.getElementById('stickyBar').classList.remove('visible');
  window.scrollTo({top:0,behavior:'smooth'});
}
 
// Init
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('f-pdate').value=new Date().toISOString().split('T')[0];
  initSig();
});
 

// ── QR Card visibility ──
function showQRCard(show) {
  var card = document.getElementById('qr-card');
  if (card) card.style.display = show ? 'block' : 'none';
}
document.addEventListener('DOMContentLoaded', function() {
  var cb = document.getElementById('isOrg');
  if (cb) {
    cb.addEventListener('change', function() { showQRCard(this.checked); });
  }
  // Also hook tcCard click
  var tc = document.getElementById('tcCard');
  if (tc) {
    tc.addEventListener('click', function() {
      setTimeout(function() {
        var cb2 = document.getElementById('isOrg');
        showQRCard(cb2 && cb2.checked);
      }, 60);
    });
  }
});
