import React from 'preact/compat';
import { useState } from 'preact/hooks';
import { CSSTransition } from 'react-transition-group';
import { CloseIcon } from '../../../Icons';
import i18n from '../../../i18n';
//import Autocomplete from '../Autocomplete';

/** The basic freetext tag control from original Recogito **/
const TagWidget = props => {

  const state = {value: ''};
  const [showDelete, setShowDelete] = useState(false);


 // Every body with a 'tagging' purpose is considered a tag
  const tagBodies = props.annotation ?
    props.annotation.bodies.filter(b => b.purpose === 'tagging') : [];

  const toggle = tag => _ => {
    if (showDelete === tag) // Removes delete button
      setShowDelete(false);
    else
      setShowDelete(tag); // Sets delete button on a different tag
  }

  const onDelete = tag => evt => {
    evt.stopPropagation();
    console.log('delete tag');
    props.onRemoveBody(tag);
  }

  const onSubmit = tag => evt => {
    //tag = evt.target.value;  //custom
    console.log('submitting...');
    if (evt.key === 'Enter'){
      props.onAppendBody({ type: 'TextualBody', purpose: 'tagging', value: state.value });
    }
    

    //old
    /*
    <div>
        <input list="list"></input>
        <datalist id="list">
          <option value="shit"></option>
        </datalist>
      </div>*/
  }

  const onInput = evt => {
    console.log(evt.target.value);
    state.value = evt.target.value;
    console.log(state);
    //props.onAppendBody({ type: 'TextualBody', purpose: 'tagging', value: evt.target.value });
  }
  
  const onBlur = evt => {
    console.log('on blur...');
    if(state.value != ''){
      props.onAppendBody({ type: 'TextualBody', purpose: 'tagging', value: state.value });
    }
    else {
      console.log('value is null');
    }
   
  }
  return (
    <div className="r6o-widget tagInput">
      {tagBodies.length > 0 &&
        <ul className="r6o-taglist">
          {tagBodies.map(tag =>
            <li key={tag.value} onClick={toggle(tag.value)}>
              <span className="label" style="color: black;">{tag.value}</span>

              {!props.readOnly &&
                <CSSTransition in={showDelete === tag.value} timeout={200} classNames="delete">
                  <span className="delete-wrapper" onClick={onDelete(tag)}>
                    <span className="delete">
                      <CloseIcon width={12} />
                    </span>
                  </span>
                </CSSTransition>
              }
            </li>
          )}
        </ul>
        
      }
      
      {!props.readOnly && tagBodies.length === 0 &&
        < div style="width: inherit">
          <input list="list"  onInput={onInput} onKeyPress={onSubmit()} onBlur={onBlur}></input>
          <datalist id="list">
            {props.vocabulary.map(vocab =>
              <option value={vocab}></option>
            )

            }

          </datalist>
        </div>

      }
    </div >
  )

};

export default TagWidget;