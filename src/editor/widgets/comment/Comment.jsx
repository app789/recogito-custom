import React from 'preact/compat';
import { useState } from 'preact/hooks';
import TimeAgo from 'timeago-react';
import DropdownMenu from './DropdownMenu';
import TextEntryField from './TextEntryField';
import { ChevronDownIcon } from '../../../Icons';
import Environment from '../../../Environment';

/** A single comment inside the CommentWidget **/
const Comment = props => {

  const [isEditable, setIsEditable] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
 
  const onMakeEditable = _ => {
    props.body.draft = true;
    setIsEditable(true);
    setIsMenuVisible(false);
  }

  const onDelete = _ => {
    props.onDelete(props.body);
    setIsMenuVisible(false);
  }

  const onUpdateComment = evt => {
    props.onUpdate(props.body, { ...props.body, value: evt.target.value });

    /*
  <TextEntryField
          editable={isEditable}
          content={props.body.value}
          onChange={onUpdateComment}
          onSaveAndClose={props.onSaveAndClose}
        />
    */
  }

  const creatorInfo = props.body.creator &&
    <div className="lastmodified">
      <span className="lastmodified-by">{props.body.creator.name}</span>
      {props.body.created &&
        <span className="lastmodified-at">
          <TimeAgo datetime={Environment.toClientTime(props.body.created)} />
        </span>
      }
    </div>

  return props.readOnly ? (
    <div className="r6o-widget comment" >
      <div className="value">Not Your Piece Of Cake</div>
      {creatorInfo}
    </div>
  ) : (isEditable ? (
    <div className={isEditable ? "r6o-widget comment editable" : "r6o-widget comment"}>

      <span>{props.body.value}</span>
      <input type="text" list="predef-labels" onChange={onUpdateComment} ></input>
      {
        props.label.length > 0 &&
        <datalist id="predef-labels">
        { 
          props.label.map(el => <option value={el}> {el} </option>)
        }
      </datalist>
      }
     


      {creatorInfo}

      <div
        className={isMenuVisible ? "icon arrow-down menu-open" : "icon arrow-down"}
        onClick={() => setIsMenuVisible(!isMenuVisible)}>
        <ChevronDownIcon width={12} />
      </div>

      {isMenuVisible &&
        <DropdownMenu
          onEdit={onMakeEditable}
          onDelete={onDelete}
          onClickOutside={() => setIsMenuVisible(false)} />
      }
    </div>
  ) : (<div class="r6o-widget comment"><p>{props.body.value}</p>

    <div
      className={isMenuVisible ? "icon arrow-down menu-open" : "icon arrow-down"}
      onClick={() => setIsMenuVisible(!isMenuVisible)}>
      <ChevronDownIcon width={12} />
    </div>

    {isMenuVisible &&
      <DropdownMenu
        onEdit={onMakeEditable}
        onDelete={onDelete}
        onClickOutside={() => setIsMenuVisible(false)} />
    }

  </div>))

}

export default Comment;