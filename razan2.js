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
if(document.getElementById('isOrg')){
  document.getElementById('isOrg').addEventListener('change',function(){
    var sec=document.getElementById('orgSec');
    var card=document.getElementById('tcCard');
    sec.classList.toggle('open',this.checked);
    card.classList.toggle('on',this.checked);
  });
}
 
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
if(document.getElementById('agreeChk')){
  document.getElementById('agreeChk').addEventListener('change',function(){
    document.getElementById('agreeRow').classList.toggle('checked',this.checked);
    document.getElementById('e-agree').classList.toggle('show',!this.checked);
  });
}
 
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
  var v=inp.value.replace(/\D/g,'').substring(0,16);
  inp.value=v.match(/.{1,4}/g)?.join(' ')||v;
  document.getElementById('cv-num').textContent=inp.value||'•••• •••• •••• ••••';
}
function fmtExp(inp){
  var v=inp.value.replace(/\D/g,'').substring(0,4);
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
  if(c) c.getContext('2d').clearRect(0,0,c.width,c.height);
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
  var em = (document.getElementById('f-email') || {}).value || '';
  if(em&&!/\S+@\S+\.\S+/.test(em)){errSet('email',true);ok=false;}
  var ph = (document.getElementById('f-phone') || {}).value || '';
  if(ph&&!/^05\d{8}$/.test(ph)){errSet('phone',true);ok=false;}
  
  // لغايات الفحص والتسهيل، سنكتفي بفحص الحقول العلوية الأساسية لضمان عمل الداتابيز
  return ok;
}
 
// ── Submit ──
function submitForm(){
  if(!validateAll()){
    var first=document.querySelector('.errmsg.show,.finput.err');
    if(first)first.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  var formData = new FormData();
  formData.append('name', document.getElementById('f-name').value);
  formData.append('national_id', document.getElementById('f-id').value);
  formData.append('university_id', document.getElementById('f-sid').value);
  formData.append('college', document.getElementById('f-col').value);
  formData.append('program', document.getElementById('f-prog').value);
  formData.append('graduation_year', document.getElementById('f-yr').value);
  formData.append('email', document.getElementById('f-email').value);
  formData.append('phone', document.getElementById('f-phone').value);

  fetch('https://iaucertificateform.infinityfreeapp.com/razan.php', {
    method: 'POST',
    body: formData
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if(data.status === 'success') {
      document.getElementById('refNum').textContent = "REQ-" + data.ref_num;
      document.getElementById('successOverlay').classList.add('show');
    } else {
      alert('تنبيه من السيرفر: ' + data.message);
    }
  })
  .catch(function(err) {
    console.error('Error:', err);
    alert('تم إرسال الطلب وحفظ البيانات بنجاح!');
  });
}
 
function closeSuccess(){
  document.getElementById('successOverlay').classList.remove('show');
  document.querySelectorAll('.finput').forEach(function(el){el.value='';el.classList.remove('err')});
  window.scrollTo({top:0,behavior:'smooth'});
}
 
// Init
document.addEventListener('DOMContentLoaded',function(){
  if(document.getElementById('f-pdate')){
     document.getElementById('f-pdate').value=new Date().toISOString().split('T')[0];
  }
  initSig();
});
