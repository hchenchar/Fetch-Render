const artists = [
    {
    id: 'degas',
    name: 'Edgar Degas'
    },
    {
    id: 'matisse',
    name: 'Henry Matisse'
    },
    {
    id: 'monet',
    name: 'Claude Monet'
    },
    {
    id: 'van-gogh',
    name: 'Vincent van Gogh'
    }
]
const Pagination = ({ items, pageSize, onPageChange }) => {
    const { Button } = ReactBootstrap;
    if (items.length <= 1) return null;
    let num = Math.ceil(items.length / pageSize);
    let pages = range(1, num);
    const list = pages.map(page => {
        return (
            <Button key={page} onClick={onPageChange} className="page-item">
                {page}
            </Button>
        );
    });
    return (
        <nav>
            <ul className="pagination justify-content-center">{list}</ul>
        </nav>
    );
};

const range = (start, end) => {
    return Array(end - start + 1)
        .fill(0)
        .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    let page = items.slice(start, start + pageSize);
    return page;
}

const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    });

    useEffect(() => {
        let didCancel = false;
        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await axios(url);
                if (!didCancel) {
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data });
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: "FETCH_FAILURE" });
                }
            };
        };
        fetchData();
        return () => {
            didCancel = true;
        };
    }, [url]);
    return [state, setUrl];
}
const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        default:
            throw new Error();
    }
};
function App() {
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState('degas');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 1;
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        'https://api.artic.edu/api/v1/artworks/search?q=degas&&fields=id,title',
        { data: [], }
    );
    const handlePageChange = (e) => {
        setCurrentPage(Number(e.target.textContent));
    };
    let page = data.data;
    if (page.length >= 1) {
        page = paginate(page, currentPage, pageSize);
        console.log(`currentPage: ${currentPage}`);
    }
    const handleSelect = (e) => {
        // New query search
        doFetch(`https://api.artic.edu/api/v1/artworks/search?q=${e.target.value}&&fields=id,title`);
        setCurrentPage(1);
    };
    return (
        <Fragment>
            <form id="select-artist">
                <label>Select an artist</label>
                <select onChange={(e) => handleSelect(e)}>
                    {artists.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </form>
            {isLoading ? (
                <div>Loading ...</div>
            ) : (
                <ul>
                    {page.map(({ id, title }) => (
                        <li key={id} className="list-item">
                            <a href={`https://www.artic.edu/artworks/${id}`}><h2>{title}</h2></a>
                        </li>
                    ))}
                </ul>
            )}
            <Pagination
                items={data.data}
                pageSize={pageSize}
                onPageChange={handlePageChange}
            ></Pagination>
        </Fragment>
    );
                    }

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
