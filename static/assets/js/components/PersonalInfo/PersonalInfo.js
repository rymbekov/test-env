import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
import cn from 'classnames';
import ToolbarScreenTop from '../toolbars/ToolbarScreenTop';
import Logger from '../../services/Logger';
import ua from '../../ua';
import * as utils from '../../shared/utils';
import localization from '../../shared/strings';
import { back } from '../../helpers/history';
import sdk from '../../sdk';
import './userInfo.scss';

export default function PersonalInfo() {
  const [data, setData] = useState({});
  const [commentsShow, toggleCommentsShow] = useState(false);

  useEffect(() => {
    Logger.log('User', 'SettingsPersonalInfoShow');
    const fetchData = async () => {
      try {
        const { data: result } = await sdk.users.fetchPersonalInfo();

        setData(result);
      } catch (error) {
        Logger.error(new Error('Can not load user personal info'), { error }, [
          'PersonalInfoLoadFailed',
          (error && error.message) || 'NoMessage',
        ]);
      }
    };

    fetchData();
  }, []);

  const destroy = () => {
    Logger.log('User', 'SettingsPersonalInfoHide');
    back('/search');
  };

  const activeTabTitle = ua.browser.isNotDesktop()
    ? [localization.ACCOUNT.title]
    : [localization.ACCOUNT.title, 'Legal', 'All data about you'];

  if (!data) return null;

  return (
    <div className="pageWrapper wrapperPageMyAccount">
      <div className="page pageMyAccount">
        <ToolbarScreenTop title={activeTabTitle} onClose={destroy} />
        <div className="pageContent">
          <div className="pageInnerContent">
            <div className="pageContainer">
              <div className="pageInnerContentBody">
                <div className="titleMainBold">All data about you</div>
                <Choose>
                  <When condition={data.comments}>
                    <ul className="userInfo">
                      <li>
                        <span className="paramName">Name:</span>{' '}
                        <span className="param">{data.user.displayName}</span>
                      </li>
                      <li>
                        <span className="paramName">Email:</span>{' '}
                        <span className="param">{data.user.email}</span>
                      </li>
                      <li>
                        <span className="paramName">Google profile email:</span>{' '}
                        <span className="param">{data.user.googleProfileEmail}</span>
                      </li>
                      <li>
                        <span className="paramName">Avatar:</span>{' '}
                        <span className="param">
                          <img
                            src={data.user.avatar}
                            width="131"
                            height="131"
                            alt={data.user.displayName}
                          />
                        </span>
                      </li>
                    </ul>

                    <ul className="userInfo">
                      <li className="openClose">
                        <div className="paramName">Comments</div>
                        <CSSTransition
                          unmountOnExit
                          in={commentsShow}
                          timeout={300}
                          classNames="fade"
                        >
                          <div className="param">
                            {data.comments.map((comment) => {
                              const { text, mentions, createdAt } = comment;

                              let html = text.replace(utils.mentionPattern, (mentionString) => {
                                const mentionID = mentionString.substring(1);
                                const mention = mentions
                                  ? mentions.find((m) => m._id === mentionID)
                                  : null;

                                if (mention) {
                                  return `<span class="itemHistoryList__main__text__mentionedUser">@${mention.displayName}</span>`;
                                }
                                return mentionString;
                              });
                              html = utils.sanitizeXSS(html, {});

                              return (
                                <Comment key={createdAt} className="comment">
                                  <If condition={html}>
                                    <CommentText dangerouslySetInnerHTML={{ __html: html }} />
                                  </If>
                                  <If condition={createdAt}>
                                    <CommentDate>{createdAt}</CommentDate>
                                  </If>
                                </Comment>
                              );
                            })}
                          </div>
                        </CSSTransition>
                        <span
                          role="button"
                          className={cn('opener', { active: commentsShow })}
                          onClick={() => {
                            Logger.log('User', 'SettingsPersonalInfoCommentsToggle', !commentsShow);
                            toggleCommentsShow(!commentsShow);
                          }}
                        />
                      </li>
                    </ul>
                  </When>
                  <Otherwise>
                    <div>Nothing to show</div>
                  </Otherwise>
                </Choose>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Comment = styled.div`
  margin: 0 0 1em 0;
`;

const CommentText = styled.div`
  font-weight: bold;
`;

const CommentDate = styled.p`
  margin: 0;
`;
