import React, { useState, useEffect, useRef } from "react";
import Latex from "react-latex";
import { Button, Radio, Checkbox, Slider, InputNumber, Row, Col } from "antd";
import { Helmet } from "react-helmet";
import { css } from "@emotion/react";
import color from "~styles/color";
import { graphql } from "gatsby";
import { Emoji } from "emoji-mart";
import { MenuFoldOutlined, GithubOutlined } from "@ant-design/icons";
import { darken } from "polished";
import SemanticScholarLogo from "~icons/semantic-scholar.svg";
import TwitterLogo from "~icons/twitter.svg";
import RetweetIcon from "~icons/retweet-blue.svg";
import LikeIcon from "~icons/like-blue.svg";
import ReplyIcon from "~icons/reply-blue.svg";
import CiteIcon from "~icons/cite.svg";
import { TwitterTweetEmbed } from "react-twitter-embed";
// import { Star } from "React-github-buttons";
import GitHubButton from 'react-github-btn'
import favicon from "~icons/favicon.png";

interface PaperData {
  abstract: string;
  citations: number;
  title: string;
  twitter: {
    likes: number;
    replies: number;
    retweets: number;
    ids: string[];
  };
  id: number;
  s2id: string;
  pdf: string;
  authors: string[];
  arXiv: string;
  posterSession: "CVPR" | "ICCV" ; 
  // | "Wednesday" | "Thursday" | "Friday";
}

interface PaperComponent extends PaperData {
  i: number;
  abstractDisplayStyle: string;
  weights: {
    citations: number;
    replies: number;
    retweets: number;
    likes: number;
  };
}

const STARTING_WEIGHTS = {
  citations: 1,
  retweets: 0.5,
  likes: 0.25,
  replies: 0.25,
};

function Tweet(props: { tweetId: string }) {
  const [tweetLoaded, setTweetLoaded] = useState(false);
  return (
    <div
      css={css`
        max-width: 350px;
        width: 100%;
        display: inline-block;
        vertical-align: top;
        margin-right: 15px;
      `}
    >
      {!tweetLoaded ? (
        <div
          css={css`
            /* text-align: center; */
            margin-top: 10px;
            color: ${color.gray8};
          `}
        >
          Loading Tweet...
        </div>
      ) : (
        <></>
      )}
      <TwitterTweetEmbed
        tweetId={props.tweetId}
        onLoad={() => setTweetLoaded(true)}
      />
    </div>
  );
}

function Paper(props: PaperComponent) {
  const [expandAbstract, setExpandAbstract] = useState(false),
    [showTweets, setShowTweets] = useState(false),
    [nTweets, setNTweets] = useState(3);

  let abstract: string | React.ReactNode;
  switch (props.abstractDisplayStyle) {
    case "full":
      abstract = props.abstract;
      break;
    case "preview":
      if (expandAbstract) {
        abstract = (
          <>
            {props.abstract}{" "}
            <span
              onClick={() => setExpandAbstract(false)}
              className="noselect"
              css={css`
                color: ${color.light.blue6};
                &:hover {
                  cursor: pointer;
                }
              `}
            >
              [Collapse]
            </span>
          </>
        );
      } else {
        abstract = (
          <>
            {props.abstract.substring(0, props.abstract.indexOf(". ") + 1)}{" "}
            <span
              onClick={() => setExpandAbstract(true)}
              className="noselect"
              css={css`
                color: ${color.light.blue6};
                &:hover {
                  cursor: pointer;
                }
              `}
            >
              [Expand]
            </span>
          </>
        );
      }
      break;
    case "hide":
      abstract = "";
      break;
    default:
      throw `No idea what ${props.abstractDisplayStyle} is! Must be in {"full", "preview", "hide"}.`;
  }

  const s2 = props.s2id ? (
    <a href={`//semanticscholar.org/paper/${props.s2id}`} target="_blank">
      <div
        css={css`
          display: inline-block;
          border: 1px solid ${color.gray5};
          padding-left: 10px;
          padding-right: 10px;
          padding-top: 2px;
          padding-bottom: 4px;
          border-radius: 3px;
          font-size: 13px;
          background-color: ${color.gray2 + "77"};
          transition-duration: 0.3s;
          margin-right: 10px;
          &:hover {
            border-color: ${color.gray6};
            background-color: ${color.gray2};
          }
        `}
      >
        <img
          src={SemanticScholarLogo}
          css={css`
            height: 17px;
            margin-right: 5px;
          `}
        />
        Semantic Scholar
      </div>
    </a>
  ) : (
    <></>
  );

  let buzz: string | number = 0;
  if (props.citations) {
    buzz += props.citations * props.weights.citations;
  }
  if (props.twitter) {
    buzz +=
      props.twitter.likes * props.weights.likes +
      props.twitter.replies * props.weights.replies +
      props.twitter.retweets * props.weights.retweets;
  }
  buzz = buzz.toFixed(2);

  const posterSession = (
    <>
      <svg
        width="25"
        height="10"
        css={css`
          margin-top: 10px;
        `}
      >
        <circle
          cx="5"
          cy="5"
          fill={
            props.posterSession === "CVPR"
              ? color.light.geekblue5
              : color.gray5
          }
          r="5"
        />
        <circle
          cx="20"
          cy="5"
          fill={
            props.posterSession === "ICCV"
              ? color.light.geekblue5
              : color.gray5
          }
          r="5"
        />
        {/* <circle
          cx="35"
          cy="5"
          fill={
            props.posterSession === "Wednesday"
              ? color.light.geekblue5
              : color.gray5
          }
          r="5"
        />
        <circle
          cx="50"
          cy="5"
          fill={
            props.posterSession === "Thursday"
              ? color.light.geekblue5
              : color.gray5
          }
          r="5"
        />
        <circle
          cx="65"
          cy="5"
          fill={
            props.posterSession === "Friday"
              ? color.light.geekblue5
              : color.gray5
          }
          r="5"
        /> */}
      </svg>
      <span
        css={css`
          color: ${color.gray7} !important;
          margin-left: 7px;
        `}
      >
        {props.posterSession}{" "}
        <span
          css={css`
            color: ${color.gray6};
          `}
        >
          Conference
        </span>
      </span>
    </>
  );

  return (
    <div
      css={css`
        * {
          color: black;
        }
        width: 100%;
        text-align: left;
        padding: 30px 0px;
        border-bottom: 1px solid ${color.gray5};
      `}
    >
      <div
        css={css`
          position: relative;
          margin-bottom: 2px;
        `}
      >
        <div
          css={css`
            display: inline-block;
            width: 100px;
            position: absolute;
            left: -110px;
            text-align: right;
            top: 2px;
          `}
        >
          <div
            css={css`
              font-weight: normal;
              text-align: right !important;
              font-size: 18px;
            `}
          >
            [{props.i + 1}]
          </div>
        </div>
        <h2
          css={css`
            font-weight: 600;
            margin-bottom: 0px;
          `}
        >
          {props.title}
        </h2>
      </div>
      <h4
        css={css`
          font-size: 15px;
          color: ${color.gray8};
          margin-bottom: 3px;
        `}
      >
        {props.authors.join(", ")}
      </h4>
      <p
        css={css`
          text-align: left;
          font-size: 14px;
        `}
      >
        {abstract}
      </p>
      <div
        css={css`
          margin-top: 10px;
        `}
      >
        {props.pdf ? (
          <a href={props.pdf.substring("https:".length)} target="_blank">
            <div
              css={css`
                display: inline-block;
                padding-left: 10px;
                padding-right: 10px;
                padding-top: 2px;
                padding-bottom: 3px;
                margin-right: 10px;
                border: 1px solid ${color.gray5};
                border-radius: 5px;
                transition-duration: 0.3s;

                &:hover {
                  border-color: ${color.gray6 + "88"};
                  background-color: ${color.gray2};
                }

                > .emoji-mart-emoji {
                  vertical-align: middle;
                }
              `}
            >
              <Emoji emoji="page_facing_up" size={16} /> PDF
            </div>
          </a>
        ) : (
          <></>
        )}
        {s2}
        {props.arXiv ? (
          <a href={props.arXiv.substring("http:".length)} target="_blank">
            <div
              css={css`
                display: inline-block;
                padding-left: 10px;
                padding-right: 10px;
                padding-top: 2px;
                padding-bottom: 3px;
                margin-right: 10px;
                border: 1px solid ${color.gray5};
                border-radius: 5px;
                transition-duration: 0.3s;

                &:hover {
                  border-color: ${color.gray6 + "88"};
                  background-color: ${color.gray2};
                }

                > .emoji-mart-emoji {
                  vertical-align: middle;
                }
              `}
            >
              <Emoji emoji="closed_book" size={16} /> arXiv
            </div>
          </a>
          ) : (
            <></>
          )}
        {props.arXiv ? (
          <a href={props.arXiv.substring("http:".length).replace("arxiv.org/abs", "www.arxiv-vanity.com/papers")} target="_blank">
            <div
              css={css`
                display: inline-block;
                padding-left: 10px;
                padding-right: 10px;
                padding-top: 2px;
                padding-bottom: 3px;
                margin-right: 10px;
                border: 1px solid ${color.gray5};
                border-radius: 5px;
                transition-duration: 0.3s;

                &:hover {
                  border-color: ${color.gray6 + "88"};
                  background-color: ${color.gray2};
                }

                > .emoji-mart-emoji {
                  vertical-align: middle;
                }
              `}
            >
              <Emoji emoji="iphone" size={16} /> Read on Mobile
            </div>
          </a>
        ) : (
          <></>
        )}
        <div
          css={css`
            border: 1px solid ${showTweets ? "#1d9bf066" : color.gray5};
            display: inline-block;
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 2px;
            padding-bottom: 4px;
            border-radius: 5px;
            transition-duration: 0.3s;
            margin-right: 10px;

            &:hover {
              background-color: #1d9bf011;
              border-color: #1d9bf066;
              cursor: pointer;
            }
            background-color: ${showTweets ? "#1d9bf011" : "transparent"};

            > span {
              color: ${color.gray10} !important;
            }
          `}
          onClick={() =>
            setShowTweets((prev) => {
              if (prev) {
                setNTweets(3);
              }
              return !prev;
            })
          }
        >
          <img
            src={TwitterLogo}
            css={css`
              height: 14px;
              margin-top: -3px;
            `}
          />{" "}
          <span>{showTweets ? "Hide" : "Show"} Tweets</span>
        </div>
      </div>
      <div
        css={css`
          margin-top: 10px;
        `}
      >
        <div
          css={css`
            display: inline-block;
            margin-right: 16px;
            .emoji-mart-emoji {
              vertical-align: middle;
            }
          `}
        >
          <Emoji emoji="bee" size={16} />{" "}
          <span
            css={css`
              color: ${color.light.yellow9};
              font-weight: 600;
            `}
          >
            {buzz}
          </span>
        </div>
        {props.citations ? (
          <div
            css={css`
              display: inline-block;
              margin-right: 16px;
            `}
          >
            <img
              src={CiteIcon}
              css={css`
                height: 13px;
                margin-top: -1px;
              `}
            />{" "}
            <span
              css={css`
                color: #d77a27;
                font-weight: 600;
              `}
            >
              {props.citations}
            </span>
          </div>
        ) : (
          <></>
        )}
        {props.twitter === null ? (
          <></>
        ) : (
          <div
            css={css`
              display: inline-block;
            `}
          >
            <div
              css={css`
                /* background-color: #1d9bf0; */
                display: inline-block;

                > div {
                  padding-top: 2px;
                  padding-bottom: 4px;
                  border-radius: 5px;
                  display: inline-block;
                  margin-right: 16px;
                  > span {
                    color: #1d9bf0 !important;
                    font-weight: 600;
                  }
                  > img {
                    height: 13px;
                    display: inline-block;
                    margin-top: -2px;
                  }
                }
              `}
            >
              <div>
                <img src={ReplyIcon} /> <span>{props.twitter.replies}</span>
              </div>
              <div>
                <img src={RetweetIcon} /> <span>{props.twitter.retweets}</span>
              </div>
              <div>
                <img src={LikeIcon} /> <span>{props.twitter.likes}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {posterSession}
      {showTweets ? (
        <div
          css={css`
            max-width: 1200px;
          `}
        >
          {props.twitter.ids
            .slice(0, nTweets)
            .map((tweetId: string, i: number) => (
              <Tweet tweetId={tweetId} key={i} />
            ))}
        </div>
      ) : (
        <></>
      )}
      {showTweets && props.twitter.ids.length > nTweets ? (
        <div
          css={css`
            border: 1px solid ${color.gray5};
            display: block;
            padding-left: 10px;
            padding-right: 10px;
            padding-top: 2px;
            padding-bottom: 4px;
            border-radius: 5px;
            transition-duration: 0.3s;
            margin-right: 10px;
            margin-top: 15px;
            max-width: 1080px;
            text-align: center;

            &:hover {
              cursor: pointer;
            }
            background-color: #1d9bf011;
            border-color: #1d9bf066;

            > span {
              color: ${color.gray10} !important;
            }
          `}
          onClick={() => setNTweets((prev) => prev + 3)}
        >
          <img
            src={TwitterLogo}
            css={css`
              height: 14px;
              margin-top: -3px;
            `}
          />{" "}
          <span>Show More</span>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

function DecimalStep(props: { inputValue: number; setInputValue; setDirty }) {
  return (
    <Row>
      <Col span={12}>
        <Slider
          min={0}
          max={1}
          onChange={(value: number) => {
            if (isNaN(value)) {
              return;
            }
            props.setInputValue(value);
            props.setDirty(true);
          }}
          value={typeof props.inputValue === "number" ? props.inputValue : 0}
          step={0.01}
          tooltipVisible={false}
        />
      </Col>
      <Col
        span={4}
        css={css`
          margin-top: -12px;
        `}
      >
        <InputNumber
          min={0}
          max={1}
          style={{ margin: "0 16px" }}
          step={0.01}
          value={props.inputValue}
          onChange={(value: number) => {
            if (isNaN(value)) {
              return;
            }
            props.setInputValue(value);
            props.setDirty(true);
          }}
        />
      </Col>
    </Row>
  );
}

function SortWeights(props: { setSortWeights }) {
  const [citationsInput, setCitationsInput] = useState(
      STARTING_WEIGHTS.citations
    ),
    [retweetsInput, setRetweetsInput] = useState(STARTING_WEIGHTS.retweets),
    [likesInput, setLikesInput] = useState(STARTING_WEIGHTS.likes),
    [repliesInput, setRepliesInput] = useState(STARTING_WEIGHTS.replies),
    [isDirty, setDirty] = useState(false);

  return (
    <>
      <div
        css={css`
          font-weight: 600;
          margin-bottom: 10px;
          margin-top: 30px;
        `}
      >
        Sorting Weights
      </div>
      <div
        css={css`
          > div {
            margin-bottom: 0px;
            * {
              color: black;
            }
            > div:nth-child(1) {
              color: white !important;
              margin-bottom: -8px;
            }
          }
        `}
      >
        <div>
          <div>Citations</div>{" "}
          <DecimalStep
            inputValue={citationsInput}
            setInputValue={setCitationsInput}
            setDirty={setDirty}
          />
        </div>
        <div>
          <div>Replies</div>{" "}
          <DecimalStep
            inputValue={repliesInput}
            setInputValue={setRepliesInput}
            setDirty={setDirty}
          />
        </div>
        <div>
          <div>Retweets</div>{" "}
          <DecimalStep
            inputValue={retweetsInput}
            setInputValue={setRetweetsInput}
            setDirty={setDirty}
          />
        </div>
        <div>
          <div>Likes</div>{" "}
          <DecimalStep
            inputValue={likesInput}
            setInputValue={setLikesInput}
            setDirty={setDirty}
          />
        </div>
        <Button
          css={css`
            width: 100%;
            margin-top: 8px;
            background-color: ${isDirty
              ? darken(0.1, "#7f9ef3")
              : darken(0.4, "#7f9ef3")} !important;
            filter: ${isDirty ? "saturate(1)" : "saturate(0.3)"};
            border-color: transparent !important;
            &:hover {
              cursor: ${isDirty ? "pointer" : "default"} !important;
            }
            > span {
              color: ${isDirty ? color.gray1 : color.gray4 + "aa"} !important;
            }
          `}
          onClick={() => {
            // Checks if already sorted
            if (!isDirty) {
              return;
            }

            props.setSortWeights({
              citations: citationsInput,
              retweets: retweetsInput,
              likes: likesInput,
              replies: repliesInput,
            });
            setDirty(false);
          }}
        >
          Sort
        </Button>
      </div>
    </>
  );
}

function PosterSessionDate(props: {
  date: string;
  posterSessions;
  setPosterSessions;
}) {
  return (
    <div>
      <Checkbox
        checked={props.posterSessions.has(props.date)}
        onChange={() => {
          props.posterSessions.has(props.date)
            ? props.setPosterSessions((prev) => {
                prev = new Set(prev);
                prev.delete(props.date);
                return prev;
              })
            : props.setPosterSessions((prev) => {
                prev = new Set(prev);
                prev.add(props.date);
                return prev;
              });
        }}
      >
        {props.date}
      </Checkbox>
    </div>
  );
}

export default function Home({ data }) {
  let papers = data.allPaperDataJson.edges;

  const [abstractDisplayStyle, setAbstractDisplayStyle] = useState("preview"),
    [foldMenu, setFoldMenu] = useState(false),
    [sortWeights, setSortWeights] = useState({
      citations: STARTING_WEIGHTS.citations,
      retweets: STARTING_WEIGHTS.retweets,
      likes: STARTING_WEIGHTS.likes,
      replies: STARTING_WEIGHTS.replies,
    }),
    [posterSessions, setPosterSessions] = useState(new Set([]));

  if (posterSessions.size !== 0) {
    papers = papers.filter((paper: { node: PaperData }) => {
      return posterSessions.has(paper.node.posterSession);
    });
  }

  papers.sort((p1: { node: PaperData }, p2: { node: PaperData }) => {
    let citations1 = p1.node.citations == null ? 0 : p1.node.citations;
    let likes1: number, retweets1: number, replies1: number;
    if (p1.node.twitter === null) {
      likes1 = 0;
      retweets1 = 0;
      replies1 = 0;
    } else {
      likes1 = p1.node.twitter.likes;
      retweets1 = p1.node.twitter.retweets;
      replies1 = p1.node.twitter.replies;
    }

    let citations2 = p2.node.citations == null ? 0 : p2.node.citations;
    let likes2: number, retweets2: number, replies2: number;
    if (p2.node.twitter === null) {
      likes2 = 0;
      retweets2 = 0;
      replies2 = 0;
    } else {
      likes2 = p2.node.twitter.likes;
      retweets2 = p2.node.twitter.retweets;
      replies2 = p2.node.twitter.replies;
    }

    return (
      sortWeights.citations * (citations2 - citations1) +
      sortWeights.likes * (likes2 - likes1) +
      sortWeights.retweets * (retweets2 - retweets1) +
      sortWeights.replies * (replies2 - replies1)
    );
  });

  // papers = papers.slice(0, 100);

  return (
    <div
      css={css`
        background-color: ${color.gray1};
        min-height: 100vh;
        color: white;
        text-align: center;
      `}
    >
      <Helmet
        title="Long-Tail Buzz"
        link={[
          {
            rel: "shortcut icon",
            type: "image/png",
            href: `${favicon}`,
          },
        ]}
      />
      {/* <header
        css={css`
          box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
          padding-top: 10px;
          padding-bottom: 10px;
          position: relative;
          z-index: 99 !important;
        `}
      >
        <h2>Hello, world!</h2>
        <Latex>
          The center of the universe is at $5+4$. One can also do something like
          $5+4$.
        </Latex>
      </header> */}
      {/* TODO: link to github/license */}
      <div
        css={css`
          display: grid;
          grid-template-columns: ${foldMenu
            ? "45px calc(100% - 45px)"
            : "256px calc(100% - 256px)"};
        `}
      >
        <div
          css={css`
            background-color: ${foldMenu ? "transparent" : color.dark.blue1};
            color: white;
            grid-row: 1;
            grid-column: 1;
            height: 100vh;
            overflow-y: auto;
            position: sticky;
            top: 0px;
            padding: 15px 15px;
            text-align: left;
            * {
              color: white;
            }
          `}
        >
          {foldMenu ? (
            <MenuFoldOutlined
              css={css`
                margin-top: 2px;
                font-size: 18px;
                transform: rotate(180deg);
                * {
                  color: ${color.dark.geekblue5} !important;
                }
                padding: 3px;
                border-radius: 2px;
                transition-duration: 0.1s;

                &:hover {
                  cursor: pointer;
                  background-color: ${color.gray4};
                }
              `}
              onClick={() => setFoldMenu((prev) => !prev)}
            />
          ) : (
            <div>
              <div
                css={css`
                  font-weight: 600;
                  margin-bottom: 8px;
                  text-align: left;
                  font-size: 16px;
                  margin-bottom: 15px;
                `}
              >
                <span
                  css={css`
                    .emoji-mart-emoji {
                      vertical-align: middle;
                    }
                  `}
                >
                  <Emoji emoji="bee" size={18} /> Long-Tail Buzz{" "}
                  <span
                    css={css`
                      font-weight: normal;
                    `}
                  >
                    - 2021
                  </span>
                </span>
                <MenuFoldOutlined
                  css={css`
                    float: right;
                    margin-top: 2px;
                    font-size: 18px;
                    * {
                      color: ${color.dark.geekblue8} !important;
                    }
                    padding: 3px;
                    border-radius: 2px;
                    transition-duration: 0.1s;

                    &:hover {
                      cursor: pointer;
                      background-color: ${color.gray9};
                    }
                  `}
                  onClick={() => setFoldMenu((prev) => !prev)}
                />
              </div>
              <SortWeights setSortWeights={setSortWeights} />
              <div
                css={css`
                  font-weight: 600;
                  margin-bottom: 3px;
                  margin-top: 30px;
                `}
              >
                Conferences
              </div>
              <div
                css={css`
                  > div {
                    margin-bottom: 3px;
                  }
                `}
              >
                <PosterSessionDate
                  date="CVPR"
                  posterSessions={posterSessions}
                  setPosterSessions={setPosterSessions}
                />
                <PosterSessionDate
                  date="ICCV"
                  posterSessions={posterSessions}
                  setPosterSessions={setPosterSessions}
                />
                {/* <PosterSessionDate
                  date="Wednesday"
                  posterSessions={posterSessions}
                  setPosterSessions={setPosterSessions}
                />
                <PosterSessionDate
                  date="Thursday"
                  posterSessions={posterSessions}
                  setPosterSessions={setPosterSessions}
                />
                <PosterSessionDate
                  date="Friday"
                  posterSessions={posterSessions}
                  setPosterSessions={setPosterSessions}
                /> */}
              </div>
              <div
                css={css`
                  font-weight: 600;
                  margin-bottom: 8px;
                  margin-top: 30px;
                `}
              >
                Abstracts
              </div>
              <Radio.Group
                css={css`
                  width: 100%;

                  * {
                    background-color: transparent !important;
                    /* width: 100% !important; */
                  }

                  .ant-radio-button-checked {
                    background-color: ${color.dark.geekblue4} !important;
                    z-index: -99 !important;
                  }
                  .ant-radio-button-wrapper {
                    &:before {
                      background-color: ${color.dark.geekblue7} !important;
                    }
                    border-color: ${color.dark.geekblue7} !important;
                    width: 33% !important;
                    text-align: center;
                  }
                  .ant-radio-button-wrapper-checked > span {
                    color: white !important;
                  }
                `}
                onChange={(e) => setAbstractDisplayStyle(e.target.value)}
                value={abstractDisplayStyle}
              >
                <Radio.Button value="full">Full</Radio.Button>
                <Radio.Button value="preview">Preview</Radio.Button>
                <Radio.Button value="hide">Hide</Radio.Button>
              </Radio.Group>
            </div>
          )}
        </div>
        <div
          css={css`
            grid-row: 1;
            grid-column: 2;
            @media (max-width: 1500px) {
              max-width: calc(100% - 50px);
              margin-left: 50px;
            }
          `}
        >
          <div
            css={css`
              /* background-color: white; */
              margin-right: 5%;
              margin-left: 5%;
              margin-top: 25px;
              margin-bottom: 80px;
              text-align: left;
            `}
          >
            <h1
              css={css`
                text-align: left;
                font-weight: 600;
              `}
            >
              <span
                css={css`
                  .emoji-mart-emoji {
                    vertical-align: middle;
                  }
                `}
              >
                <Emoji emoji="bee" size={28} /> Long-Tail Buzz{" "}
              </span>
              <span
                css={css`
                  font-weight: normal;
                `}
              >
                - 2021
              </span>
            </h1>
            <h3
              css={css`
                margin-top: -10px;
              `}
            >
              Maintained by {" "}
              <a
                href="//rahulvigneswaran.github.io"
                target="_blank"
                css={css`
                  color: ${color.light.blue6} !important;
                  border-bottom: 1px dashed ${color.light.blue6};
                `}
              >
                Rahul Vigneswaran
              </a>
            </h3>
            <p
              css={css`
                color: ${color.gray8};
                max-width: 535px;
                margin-top: 15px;
                margin-bottom: 10px;
              `}
            >
            Long-Tail Buzz displays the most discussed {" "}
              <a
                href="//rahulvigneswaran.github.io/post/long-tail-classification/"
                target="_blank"
                css={css`
                  color: ${color.light.blue6} !important;
                  border-bottom: 1px dashed ${color.light.blue6};
                `}
              >
                long-tail
              </a> papers at <b>CVPR and ICCV 2021</b> using
              Twitter for indexing discussions and Semantic Scholar for
              collecting citation data. {" "}
              <a
                href="//mattdeitke.com"
                target="_blank"
                css={css`
                  color: ${color.light.blue6} !important;
                  border-bottom: 1px dashed ${color.light.blue6};
                `}
              >
                Matt Deitke
              </a> is a really cool person, go check him out! This site is a fork of his {" "}
              <a
                href="//mattdeitke.com/cvpr-buzz"
                target="_blank"
                css={css`
                  color: ${color.light.blue6} !important;
                  border-bottom: 1px dashed ${color.light.blue6};
                `}
              >
                CVPR Buzz
              </a>. 
            </p>
            <p
              css={css`
                color: ${color.gray8};
              `}
            >
              To add data or see how it was collected, checkout the GitHub repo:
            </p>
            <div>
              <div
                css={css`
                  transition-duration: 0.3s;
                  display: inline-block;
                  padding: 10px 12px;
                  padding-bottom: 12px;
                  padding-left: 0px;
                  border-radius: 5px;
                  margin-top: -5px;
                  &:hover {
                    opacity: 0.85;
                  }
                `}
              >
                <a
                  href="//github.com/rahulvigneswaran/longtail-buzz"
                  target="_blank"
                  css={css`
                    margin-top: -10px;
                  `}
                >
                  <GithubOutlined
                    css={css`
                      font-size: 23px;
                      vertical-align: middle;
                      color: black;
                    `}
                  />{" "}
                  <div
                    css={css`
                      vertical-align: middle;
                      display: inline-block;
                      font-size: 15px;
                      color: black;
                      margin-top: -3px;
                      margin-left: 3px;
                    `}
                  >
                    /rahulvigneswaran/longtail-buzz
                  </div>
                </a>
              </div>
              <GitHubButton href="https://github.com/rahulvigneswaran/longtail-buzz" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star rahulvigneswaran/longtail-buzz on GitHub">Star</GitHubButton>
              {/* <Star owner="mattdeitke" repo="cvpr-buzz" /> */}
            </div>
            <div
              css={css`
                color: ${color.gray6};
                border-top: 1px solid ${color.gray4};
                margin-top: 30px;
                margin-bottom: -20px;
                padding-top: 5px;
              `}
            >
              {papers.length} results
            </div>
            {papers.map((paper: { node: PaperData }, i: number) => (
              <Paper
                abstractDisplayStyle={abstractDisplayStyle}
                weights={sortWeights}
                key={paper.node.id}
                {...paper.node}
                i={i}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const query = graphql`
  {
    allPaperDataJson {
      edges {
        node {
          abstract
          citations
          title
          twitter {
            likes
            replies
            retweets
            ids
          }
          id
          s2id
          pdf
          posterSession
          authors
          arXiv
        }
      }
    }
  }
`;
