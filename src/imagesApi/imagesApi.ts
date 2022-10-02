import axios from "axios";

//https://api.unsplash.com/search/photos?&client_id=LXLgtlUaEkqcNg940B9ZpO_jUm5jqRR_yTRwYO7HlsM&page=1&query=man
//https://api.unsplash.com/search/photos?page=3&query=oslo&client_id=LXLgtlUaEkqcNg940B9ZpO_jUm5jqRR_yTRwYO7HlsM
//her iki url de ayni datalari donuyor
//icinde query olarak yapilan request ise bize bir obje ve bu obje icinde total,total_pages, ve results(images lerden olusan 
// dizi properysi) olarak donecektir..ondan dolayi asagida logic yaparak istek gonderilecek url i belirlerken gelen data
//lar farkli formattadir query ile normald direk images leri donduren endpoint, ondan dolayi gelen data alinirken dikkat edlmelidir

//https://api.unsplash.com/photos?client_id=LXLgtlUaEkqcNg940B9ZpO_jUm5jqRR_yTRwYO7HlsM 
//bu url bize dogrudan icinde images objelerinin oldugu dizi verir yani donen data dizidir direk


const clientID="?client_id=jWPo5EWfWZSHjclyWQ4qYzOVpQPomNwqdaPvSLCJSpA";
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;


const imagesApi=axios.create({
    baseURL:"https://api.unsplash.com"
})


//urlPage: &page=1 bu 1 i state te tutacagiz page,setPage diye cunku bu dinamik olarak degisecek
//urlQuery &query=query  query data si da yine input e kullanicinin girdigi data olacak dolaisi ile onu da
//query-setQuery diye useState ile tutacagiz ve de burda useFetch islemi icin eger kullanici
//url e queryy si ile gelmis ise biz o zaman query olan url i kullan diyecegiz yok kulanici
//query ile gelmemis ise o zaman da anlaycagiz ki kullanici, arama yapmak istemiyor o zaman da
//normal query olmadan yapilan bir request url ne istek gonderecegiz ve bu logici biz
//burda react-query ile getImages icinde yapaagiz..
export const getImages=async(query:string="",page:number=1)=>{
// const res=await imagesApi.get<any>(`/photos/random/?client_id=${api_key}&count=20`);
// return res.data;
let url;
if(query){
    url=`${searchUrl}${clientID}&page=${page}&query=${query}`
}else{
    url=`${mainUrl}${clientID}&page=${page}`
}
   const res=await imagesApi.get(url);
   return res.data;
   
}


export default imagesApi;

