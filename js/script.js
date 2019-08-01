/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-danger */
import { h, render, Component } from "preact";
import css from "./tablo.css";
/** @jsx h */
import { getAge } from "./datehelper";

const Entry = ({
  candidate, id, visible, handleClick,
}) => {
  const imgName = `${candidate.name.toLowerCase().replace("ová", "").replace(" ", "_")}.jpg`;

  return (
    visible
      ? (
        <div className="entry" style={{ height: "auto", "max-height": "1000px" }} role="button" tabIndex="0" onClick={() => handleClick(id)}>
          <img className="entry-img" alt={candidate.name} src={`https://data.irozhlas.cz/us-prezident-kandidati/fotky/${imgName}`} />
          <div className="entry-info">
            <div className="entry-name">{candidate.name}</div>
            <div className="entry-blurb">{candidate.blurb}</div>
            <div className="entry-age">{`${getAge(candidate.dob)} let`}</div>
            <div className="entry-desc" dangerouslySetInnerHTML={{ __html: candidate.desc }} />
          </div>
          <div className="entry-arrow-up">⌃</div>
        </div>
      )
      : (
        <div className="entry" role="button" tabIndex="0" onClick={() => handleClick(id)}>
          <img className="entry-img" alt={candidate.name} src={`https://datarozhlas.s3.eu-central-1.amazonaws.com/us-prezident-kandidati/fotky/${imgName}`} />
          <div className="entry-info">
            <div className="entry-name">{candidate.name}</div>
            <div className="entry-blurb">{candidate.blurb}</div>
          </div>
          <div className="entry-arrow-down">⌄</div>
        </div>
      )
  );
};

class Tablo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCand: null,
      data: [],
      initCand: document.getElementById("kandidati").innerHTML,
    };
    document.getElementById("kandidati").innerHTML = "";
    this.handleEntryClick = this.handleEntryClick.bind(this);
    this.handleKeys = this.handleKeys.bind(this);
  }

  componentDidMount() {
    this.loadData();
    document.documentElement.addEventListener("keyup", this.handleKeys);
    document.documentElement.addEventListener("mouseup", this.handleMouseUp);
  }

  loadData() {
    const { initCand } = this.state;
    const xhr = new XMLHttpRequest();
    const url = "https://data.irozhlas.cz/us-prezident-kandidati/data/data.json";
    xhr.open("get", url, true);
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      const prioCand = data.filter(item => item.name === initCand);
      if (prioCand.length === 1) {
        this.setState({
          data: prioCand.concat(data.filter(item => item.name !== initCand)),
          selectedCand: 0,
        });
      } else {
        this.setState({ data });
      }
    };
    xhr.send();
  }

  handleKeys(event) {
    const { selectedCand, data } = this.state;
    if (selectedCand !== null) {
      if (event.key === "Escape") {
        this.setState({
          selectedCand: null,
        });
        document.documentElement.style.overflow = "auto";
      } else if (event.key === "ArrowRight") {
        this.setState({
          selectedCand: (selectedCand + 1) % data.length,
        });
      } else if (event.key === "ArrowLeft") {
        this.setState({
          selectedCand: selectedCand === 0 ? data.length - 1 : selectedCand - 1,
        });
      }
    }
  }

  handleEntryClick(id) {
    const { selectedCand } = this.state;
    const newId = (selectedCand === id) ? null : id;
    this.setState({
      selectedCand: newId,
    });
  }

  render() {
    const { selectedCand, data } = this.state;

    return (
      <div>
        <h3>Vyzyvatelé Donalda Trumpa</h3>
        <div id="tablo">
          {data.map((candidate, candId) => (
            <Entry
              candidate={candidate}
              id={candId}
              visible={selectedCand === candId}
              handleClick={this.handleEntryClick}
            />
          ))}
        </div>
      </div>
    );
  }
}

// ========================================
render(<Tablo />, document.getElementById("kandidati"));
