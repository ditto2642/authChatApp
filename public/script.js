function newAccount(use,pass, acKey){
  $.get(`/newUser/${use}/${pass}/${acKey}`, (data)=>alert(data));
}

function login(use,pass){
  $.get(`/login/${use}/${pass}`, (data)=>{
    if(data.status){
      window.location.pathname = `protected/${data.key}/index.html`;
    } else {
      alert(data.key);
    }
  });
}

function test(){
  console.log("test");
}
