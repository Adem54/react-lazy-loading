
const Search = () => {
  return (
    <>
      <form className="aside-search">
        <input className="search" placeholder="Search" />
        <button type="submit" className="btn-search">
          {" "}
          <i className="fa-solid fa-magnifying-glass"></i>{" "}
        </button>
      </form>
    </>
  );
};

export default Search;
