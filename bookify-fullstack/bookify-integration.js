/* Bookify backend bridge. Loaded by Express at response time; original frontend files are not edited. */
(() => {
  const API='/api';
  const guestId=localStorage.getItem('bookify_guest_id')||('guest-'+Math.random().toString(36).slice(2)+Date.now());
  localStorage.setItem('bookify_guest_id',guestId);
  const headers=()=>({'Content-Type':'application/json','X-Guest-Id':guestId,...(localStorage.getItem('bookify_token')?{Authorization:'Bearer '+localStorage.getItem('bookify_token')}:{})});
  async function api(path,options={}){
    const response=await fetch(API+path,{...options,headers:{...headers(),...(options.headers||{})}});
    const data=await response.json().catch(()=>({message:'Unexpected server response'}));
    if(!response.ok)throw new Error(data.message||'Request failed');return data;
  }
  const notify=(message)=>window.alert(message);
  const value=id=>document.getElementById(id)?.value?.trim()||'';
  const currentCard=()=>{const el=window.event?.currentTarget||document.activeElement;return el?.closest('.product-card')||el?.closest('.image-holder')||el?.closest('.box')||el?.parentElement;};
  async function refreshCart(){try{const c=await api('/cart');const count=document.getElementById('cart-count');const total=document.getElementById('total-price');if(count)count.textContent=c.itemCount||0;if(total)total.textContent='₹'+(c.subtotal||0);return c}catch(e){console.warn(e);}}
  // The original pages call addToCart with either (price) or (title, price).
  window.addToCart=async function(first,second){
    try{let title,price,image='';if(typeof second==='number'){title=String(first);price=second;const card=currentCard();image=card?.querySelector('img')?.src||'';}else{price=Number(first);const card=currentCard();title=card?.querySelector('.product-name,h3,h2')?.textContent?.trim()||'Book';image=card?.querySelector('img')?.src||'';}
      const c=await api('/cart/items',{method:'POST',body:JSON.stringify({title,price,image})});
      const count=document.getElementById('cart-count');if(count)count.textContent=c.itemCount;
      const total=document.getElementById('total-price');if(total)total.textContent='₹'+c.subtotal;
      notify(`${title} added to your cart.`);
    }catch(e){notify(e.message)}
  };
  window.applyCoupon=async function(){try{const c=await api('/cart');if(!c.itemCount)throw new Error('Your cart is empty.');if(value('couponCode').toUpperCase()!=='FIRST10')throw new Error('Invalid coupon code. Please try again.');const discounted=(c.subtotal*.9).toFixed(2);const out=document.getElementById('discounted-price');if(out)out.textContent=discounted;document.getElementById('discountMessage')?.classList.remove('hidden');notify('FIRST10 coupon applied: 10% off.');}catch(e){notify(e.message)}};

  // Sign-up and sign-in retain the exact original form markup and appearance.
  document.getElementById('signup-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const data=await api('/auth/register',{method:'POST',body:JSON.stringify({name:value('username'),email:value('signup-email'),password:value('signup-password')})});localStorage.setItem('bookify_token',data.token);notify('Account created successfully. Welcome to Bookify!');location.href='index.html';}catch(err){notify(err.message)}});
  document.getElementById('login-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const data=await api('/auth/login',{method:'POST',body:JSON.stringify({email:value('signin-email'),password:value('signin-password')})});localStorage.setItem('bookify_token',data.token);notify('Login successful.');location.href='index.html';}catch(err){notify(err.message)}});

  // Review submission and loading persisted reviews into the existing carousel.
  document.getElementById('form')?.addEventListener('submit',async e=>{e.preventDefault();try{await api('/reviews',{method:'POST',body:JSON.stringify({name:value('name'),book:value('book'),review:value('review')})});e.target.reset();notify('Thank you! Your review has been saved.');}catch(err){notify(err.message)}});
  async function loadReviews(){const list=document.getElementById('review-list');if(!list)return;try{const reviews=await api('/reviews');if(!reviews.length)return;list.innerHTML=reviews.map((r,i)=>`<div class="carousel-item ${i===0?'active':''}"><div class="review-card"><h4>${escapeHtml(r.name)}</h4><h5>${escapeHtml(r.book)}</h5><p>${escapeHtml(r.review)}</p></div></div>`).join('')}catch(e){console.warn(e)}}
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  document.getElementById('bookRequestForm')?.addEventListener('submit',async e=>{e.preventDefault();try{await api('/requests',{method:'POST',body:JSON.stringify({name:value('name'),email:value('email'),bookTitle:value('bookTitle'),authorName:value('authorName'),additional:value('additional')})});document.getElementById('popup').style.display='block';e.target.reset();}catch(err){notify(err.message)}});

  // Checkout stores the order and customer details. Card/CVV values are deliberately never collected or sent.
  const paymentForm=document.querySelector('form')&&location.pathname.toLowerCase().endsWith('/payment.html')?document.querySelector('form'):null;
  async function placeOrder(){try{const order=await api('/orders',{method:'POST',body:JSON.stringify({customer:{name:value('name'),email:value('email'),address:value('address'),city:value('city'),state:value('state'),zip:value('zip')},coupon:sessionStorage.getItem('bookify_coupon')||''})});sessionStorage.removeItem('bookify_coupon');sessionStorage.setItem('bookify_last_order',order.orderId);location.href='order.html';}catch(e){notify(e.message)}}
  paymentForm?.addEventListener('submit',e=>{e.preventDefault();placeOrder()});
  if(paymentForm){const payLink=[...document.querySelectorAll('a')].find(a=>a.getAttribute('href')==='order.html');payLink?.addEventListener('click',e=>{e.preventDefault();placeOrder()});}

  // Newsletter form is present on the home page without an id.
  document.querySelectorAll('form').forEach(form=>{if(form===paymentForm||form.id||!form.querySelector('input[type="email"]'))return;form.addEventListener('submit',async e=>{e.preventDefault();try{await api('/newsletter',{method:'POST',body:JSON.stringify({email:form.querySelector('input[type="email"]').value})});notify('Thanks for subscribing to Bookify!');form.reset()}catch(err){notify(err.message)}})});

  // Keep the original page layout; hydrate cart summary and persist the FIRST10 choice for checkout.
  if(location.pathname.toLowerCase().endsWith('/carts.html')){
    refreshCart();document.getElementById('couponbtn')?.addEventListener('click',()=>{if(value('couponCode').toUpperCase()==='FIRST10')sessionStorage.setItem('bookify_coupon','FIRST10')});
  }
  if(location.pathname.toLowerCase().endsWith('/review.html'))loadReviews();

  // Search existing book cards without altering their markup or styling.
  const search=document.getElementById('search-box');search?.addEventListener('input',()=>{const q=search.value.toLowerCase();document.querySelectorAll('.image-holder,.product-card,.arrivals-slider .box').forEach(card=>{card.style.display=card.textContent.toLowerCase().includes(q)?'':'none'})});
  refreshCart();
})();
