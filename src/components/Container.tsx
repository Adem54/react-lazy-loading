import axios from "axios";

import {
  useEffect,
  useRef,
  useState
} from "react";
import Image from "./Image";

const clientID = "?client_id=jWPo5EWfWZSHjclyWQ4qYzOVpQPomNwqdaPvSLCJSpA";
//Bu boyle direk yazilmaz, guvenli degil, .env.development ta tutulmalidir
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;

const Container = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const mounted = useRef(false); //default olarak component unmounted olarak aliyoruz
  const [newImages, setNewImages] = useState(false);

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
          return data;
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
    setPage((oldPage) => oldPage + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newImages]);

  const event = () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      console.log("scroll event handling")
      setNewImages(true); //kullanici scroll yapmis ve yeni images ler gelmistir eger
      //scroll cubugu kullanici tarafindan yukardan asgi cekilmis ve en alta scroll cubugu dokundug anda fetch yapmaya baslar
      //iste biz scroll cubugunun kullanici tarafindan an alta degdirilmesini bu sekilde kontrol ederiz
    }
  };
  //tabi ki scrool yapilinca, scroll cubugu en asagi degdigince bir fonksiyon tetikleenmesini saglayacak olan
  //islemi de useEffect iceriisinde yapariz..Bu da bestpractise dir bzim javascript addEventlistener uzerinden
  //event.handling leri kullanacagimz zamn bu sekilde kullaniriz ve de yine ayni useEffect icinde clean-up fonksiyonu ile de o islem bitince sileriz
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
    7.
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

export default Container;
