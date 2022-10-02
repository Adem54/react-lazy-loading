import axios from "axios";
import {
  useEffect,
  useRef,
  useState
} from "react";
import './App.css';
import Image from './components/Image';
const clientID = "?client_id=jWPo5EWfWZSHjclyWQ4qYzOVpQPomNwqdaPvSLCJSpA";
//Bu boyle direk yazilmaz, guvenli degil, .env.development ta tutulmalidir
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;


function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const mounted = useRef(false); //default olarak component unmounted olarak aliyoruz
  const [newImages, setNewImages] = useState(false);

  /*  
  BIRBIRINE COK BENZEYEN ENDPOINTLERE FETCH ISLEMI YAPARKEN BOYLE BIR YAKLASIMDA BULUNABILIRZ...
  BU FARKLI BIR YAKLASIMDIR...BESTPRACTISE....BU YAKLASIMI BILMEK COOK ONEMLIDIR
  ASAGIDAKI YAKLASIMA COOK BENZIYOR...ONEMLI...BU YAKLASIM I IYI BILMEMIZ GEREKIYOR...

  export function saveProductApi(product) {
  return fetch("http://localhost:3004/products/" + (product.id || ""), {
    method: product.id ? "PUT" : "POST",
    headers: { "content-type": "application/json" }, //defaultta bu sekilde gelir zaten
    body: JSON.stringify(product),
  })
    .then(handleResponse) //Biz burda apiye baglanma operasyonundan then ile ilgili olan kisimlar
     icin kendi fonksiyonumuzu olusturup onunla bir kerede sonucumuzu dondurecegiz daha da temiz kod yazmak icin...
    .catch(handleError);
}

export function saveProduct(product) {
  return function (dispatch) {
    Bu dispatch redux-thunk tan gelip action imizin devreye girmesini sagliyordu
    return saveProductApi(product).then((savedProduct) => {//bize kaydedilen urun donecek.
      Veri geldikten sonra redux a haber veriyoruz verinin update mi, save mi oldugunu.
      product.id
      Altta yapdgiimiz hareketlerle redux in reducer larini devreye sokmus olduk...
        ? dispatch(updateProductSuccess(savedProduct))
        : dispatch(createProductSuccess(savedProduct));
    }).catch(error=>{throw error}) 
  };
}
  
  */
  const fetchImages = async () => {
    setLoading(true);
    let url;
    const urlPage = `&page=${page}`;
    const urlQuery = `&query=${query}`;
    if (query) {
      url = `${searchUrl}${clientID}${urlPage}${urlQuery}`;
    } else {
      url = `${mainUrl}${clientID}${urlPage}`;
    }
    try {
      const response = await axios.get(url);
      const data = response.data;
      setImages((oldImages: React.SetStateAction<any>) => {
        if (query && page === 1) {
          return [...data.results];
        } else if (query) {
          return [...images, ...data.results];
        } else {
          return [...oldImages,...data];
        }
      });
    } catch (error) {
    } finally {
      setNewImages(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
console.log("newImages: ",newImages);
  useEffect(() => {
    //kodumuz buraya giiriyorsa o zaman mount edilmis demektir, ve deriz ki eger mount.current false ise yani component mount
    //edilmemis ise o zamn sen bu degeri true yap ve mount edildigini anladigimiz icin useEffect disinda
    //kullanirken bunun mount-edilip edilmedingi bilmis oluruz
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!newImages) return; //yeni image ler gelmis ise, yani fetch gerceklesmis ve comp. mount edilmistir
    if (loading) return;
    //Burda component mount edildiginde page in 1 artmasini sagliyor yani burasi cook kritik iyi anlasilmali¨
    //Burda sunu sgliyor bir fetch devam ederken baska bir fetch devreye girmemesi icin, component mount olduktan sonra
    //yani fetch islemi esnasinda component ortadan kalkiyor cunku re-render var ve tekrar component datalari
    //alip gelerek mount oluyor ve bu esnada, henuz component yuklenmemisken eger kullanici scroll u
    //asagi dogru surekli cekerse art arda fetch ler yapmasina sebep olabilir, page i arttirarak ve 
    //bu da memory-leak dedegimz hata lara sonuc verecektir iste bu hatalardan kurtulmak icin
    //biz componentin mount oldugundan emin oluyoruz ondan sonra page in arttirilmasina izin veriyoruz yani
    //useRef sayesinde componentin mount ve unmount olup olmadingi kontrol etmis oluyoruz...cook onemli ince bir nokta
    //dir burasi...
    setPage((oldPage) => oldPage + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newImages]);

  const event = () => {
    //scroll u kullanici bottom a getirdigi zaman tetiklenecek method
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      console.log("scroll event handling")
      setNewImages(true); //kullanici scroll yapmis ve yeni images ler gelmistir eger
      //scroll cubugu kullanici tarafindan yukardan asgi cekilmis ve en alta scroll cubugu dokundug anda fetch yapmaya baslar
      //iste biz scroll cubugunun kullanici tarafindan an alta degdirilmesini bu sekilde kontrol ederiz
    }
  };
  //tabi ki scrool yapilinca, scroll cubugu en asagi degdigince bir fonksiyon tetikleenmesini saglayacak olan
  //islemi de useEffect iceriisinde yapariz..Bu da bestpractise dir bzim javascript addEventlistener uzerinden
  //event.handling leri kullanacagimz zamn bu sekilde kullaniriz ve de yine ayni useEffect
  // icinde clean-up fonksiyonu ile de o islem bitince sileriz
  useEffect(() => {
    window.addEventListener("scroll", event);
    return () => window.removeEventListener('scroll', event);
  }, []);

  /* Lazyloading images-inifinitve scroll da neleri tutmlaiyiz state olarak 
    1-Tum image i tutan images dizisini get request ile getirdikten sonra kendi lokal stattimize almalyiz
    bu context olur eger varsa redux olur ya da dogrudan  icinde bulundugmz componentte ki bir state olur
    2-isLoading,isError,isSuccess eger useQuery kullaniyorsak zaten ordasn hazir gelir yok kullanmiyorsak
    biz bunlari lokal statetimzde olustururuz
    3-page diye bir state tutmmiz gerekiyor, bu da kullanici scroll down her yapmasi ayni pagination da next e basmasi
    gibi dusuneiblirz, kullanicinin her scroll-down yaptiginda yenni 6 veya her kac ise perPage olarak yani bir
    sayfada kac tane image gosteredeksek o kadari her scrolldown yapildiginda gelmesin bekliyoruz ondan dolayi da
    page in her scroll down yapiildginda 1 artmasi gerekiyor
    4-Arama islemi icin, inputa girilen degeri alacagimz bir query state ti tutmalyiz
    5-Lazy-loading isleminde bilmemiz gerekenlerden biri de
    bizim comonentimizin mount edilip edilmedingi kontrol etmek bu islem, useRef kullanilarak yapilir useEffect icinde
    cunku eger useEffect icine girerse kodumuz demekki component mount ediliyor o zaman useRef ile olusturugmuz
    degiskene isMounted.current=true yapariz useEffect icinde, useRef icinde yapariz cunku useRef useState gibi
    re-render  tetiklemiyor...Bunu bilmek cook onemli
    Peki bize lazy-loding isleminde niye boyle birseye ihtiyac var cunku, kulanici asagi dogru hizli hzli scroll yapmasi demek
    bir data fetch edilirken, baska bir data fetch islemini de  tetikleyebilri kullanici, hic farkinda olmadan veya 
    bir data fetch edilirken ornegin mevcut fetch edilmeye calisilan image lere tiklamaya calisabilir o zaman bizim
    burda component mount edildiginde bu islem gerceklesmesi icin useRef kullanmaiz gerekir yoksa uygulama error verecektir
    6.newImages, setNewImages seklinde boolean state tutarak kullanici tarafindan scrolldown yapilmasi sonucu newImages in
    fetch edilme anindan true olan data, newImages fetch edildikten sonra false olacaktir...Biz bu islemi, eger kullanici
    scroll down yapmis ve yeni data fetch etmeyi tetiklemis ise yeni data glene kadar newImages true olacaktir..
    Ve bunu biz memory-leak hatasini onlemek icin kullanacagiz yani bir fetch islemi yapilirken, ve bazen bu zamanda alabilir
    o esnada, henuz component mount edilmemis halde iken kullanici tutup scroll down yapmaya devam eder ve yeni fetch
    ler yapilmasina sebep olursa o zaman iste hataya sebep olacaktir ve uygulamayi kiaracaktir ondan dolayi da biz bir fetch 
    islemi sonlanmadan, yani component mount olmadan, baska fetch lere izin vermemeliyiz iste onu da yine burda 
    useEffect icinde useRef i de kullanarak, eger useEffect icine girmisse kod o zaman mount edilmistir diyerek
    mounted.current=true yaparz ve sonra da newImages false ise  o zaman return yapar componenti unmount ederiz yani
    newImages false ise kullanici scroll--down yapmamis cunku kullanici scrolldown-yani scroll eventyini tetiklenyince 
    newImages true oluyor, ve son olarak da loading eger true ise return ile componentt unmount edilir eger butun bunlar
    degil ise yani useEfffect icine kod girmis, newImages true ise yani scrolldown tetiklenmis ise kullanici scroll down yapmis
    ve loading yani o esnada data fetch islemi yapilmiyorsa o zaman page i setPage ile arttirarak re-render yapilmasina 
    izin verecegiz ki hata cikmadan islem yapilsin, bu onlemlerle de biz kullanicinin bekleme aninda surekli scroll yaparak
    scrooll eventini birden fazla kez tetiklemeye calimasi veya buna benzer fetch islemleri yapan butonlara ardi ardina basmasi
    ihtimallerini handel etmis oluruz..bu cook onemlidir..
    7.
  */

 
/*  
BESTPRACTISE..BACKENDDEN GELEN SEARCH ENDPOINTI ILE FRONTENDDTE SEARCH ISLEMI YAPMAK!!!!
  BACKENDDEN SEARCH ENDPOINTI ILE FRONTENDDE SEARCH ISLEMI YAPMAK...SIMDI BIZ BAZEN SEARCH ISLEMINI DIREK FRONTENDD YAPARIZ
  YANI BACKENDDEN GELEN ANA DATA UZERINDE BIZ SEARCH ISLEMI YAPARIZ...ANCAK BU YONTEMIN DISINDA BIR DE BACKENDDE
  SEARCH ISLEMI YAPAN ENDPOINT IN ELIMZDE OLMA DURUMUNDA, YAPACAGIMIZ ISLEM BAMBASKADIR..BUNLARI COK IYI AYIRT ETMELIYIZ
  BIZIM BOYLE DURUMLARDA ENDPOINTI INCELEMEMIZ GEREKIR VE ENDPOINT ICINDEKI PAGE VE QUERY DINAMIK YAPILARINI FRONTENDDE
  KI INPTUMUZA KULLANICI TARAFINDAN GIRILEN DEGERI BIZ, DINAMIK OLARAK, ENDPOINTTEKI DINAMIK QYERY DEGISKENINE VERMELIYIZ..

  https://api.unsplash.com/search/photos?&client_id=LXLgtlUaEkqcNg940B9ZpO_jUm5jqRR_yTRwYO7HlsM&page=1&query=man

const clientID = "?client_id=jWPo5EWfWZSHjclyWQ4qYzOVpQPomNwqdaPvSLCJSpA";
Bu boyle direk yazilmaz, guvenli degil, .env.development ta tutulmalidir
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;
    let url;
  const urlPage = `&page=${page}`;
  const urlQuery = `&query=${query}`;
  url = `${searchUrl}${clientID}${urlPage}${urlQuery}`;
    const response = await axios.get(url);
      const data = response.data;

*/
  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (!query) return;
    if (page === 1) {//page 1 degil ise scroll yapilmis demektir scrolldown yaparkemn arama yapilmaz
      //arama yapiorsa kullanici page=1 dedir
      fetchImages();
    }
    setPage(1);
  };



  return (
    <>
      <div className="App">
      <section className="main-container">
        <form className="aside-search">
          <input className="search" 
           type='text'
           placeholder='search'
           value={query}
           onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-search"  onClick={handleSubmit}>
            {" "}
            <i className="fa-solid fa-magnifying-glass"></i>{" "}
          </button>
        </form>
        <main className="main">
          {images &&
            images.map((image: any) => {
              return <Image key={image.id} image={image} />;
            })}
        </main>
        {loading && <h2 className='loading'>Loading...</h2>}
      </section>
      </div>
    </>
  );
};

export default App;

/*
https://images.unsplash.com/photo-1662048597813-caddb58adf2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjA1MTl8MHwxfGFsbHwyfHx8fHx8Mnx8MTY2MjA3NjE5NA&ixlib=rb-1.2.1&q=80&w=1080
*/