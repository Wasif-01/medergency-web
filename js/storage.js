export const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem('medergency:'+key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem('medergency:'+key,JSON.stringify(value))}catch{}},remove(key){localStorage.removeItem('medergency:'+key)}};
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const appointments=()=>storage.get('appointments',[]);
export const saveAppointments=value=>storage.set('appointments',value);
export const notify=text=>{const n=storage.get('notifications',[]);n.unshift({id:Date.now(),text,read:false});storage.set('notifications',n)};
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const formatDate=value=>new Date(value+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
