import React from 'preact/compat';
import { useState, useRef, useEffect } from 'preact/hooks';
import Environment from '../Environment';
import setPosition from './setPosition';
import i18n from '../i18n';

/** We need to compare bounds by value, not by object ref **/
const bounds = elem => {
  const { top, left, width, height } = elem.getBoundingClientRect();
  return `${top}, ${left}, ${width}, ${height}`;
}

/**
 * The popup editor component.
 * 
 * TODO instead of just updating the current annotation state,
 * we could create a stack of revisions, and allow going back
 * with CTRL+Z.
 */
const Editor = props => {
  console.log(props.mycustom);
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  
  // The current state of the edited annotation vs. original
  const [ currentAnnotation, setCurrentAnnotation ] = useState();

  // Reference to the DOM element, so we can set position
  const element = useRef();

  // Re-render: set derived annotation state & position the editor
  useEffect(() => {
    // Shorthand: user wants a template applied and this is a selection
    const shouldApplyTemplate = props.applyTemplate && props.annotation?.isSelection;

    // Apply template if needed
    const annotation = shouldApplyTemplate ? 
      props.annotation.clone({ body: [ ...props.applyTemplate ]}) : 
      props.annotation;

    // The 'currentAnnotation' differs from props.annotation because
    // the user has been editing. Moving the selection bounds will 
    // trigger this effect, but we don't want to update the currentAnnotation
    // on move. Therefore, don't update if a) props.annotation equals
    // the currentAnnotation, or props.annotation and currentAnnotations are
    // a selection, just created by the user. 
    const preventUpdate = currentAnnotation?.isEqual(annotation) ||
      (currentAnnotation?.isSelection && annotation?.isSelection);
    //console.log('HEEEYY')
    if (!preventUpdate){
      setCurrentAnnotation(annotation);
      //console.log(props.selectedElement);
    }
      

    if (shouldApplyTemplate && props.applyImmediately){
    //console.log('hey');
      props.onAnnotationCreated(annotation.toAnnotation());
    }

    if (element.current) {
      // Note that ResizeObserver fires once when observation starts
      return initResizeObserver();
    }
  }, [ props.selectedElement, bounds(props.selectedElement) ]);

  const initResizeObserver = () => {
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        setPosition(props.wrapperEl, element.current, props.selectedElement);
      });

      resizeObserver.observe(props.wrapperEl);
      return () => resizeObserver.disconnect();
    } else {
      // Fire setPosition *only* for devices that don't support ResizeObserver
      setPosition(props.wrapperEl, element.current, props.selectedElement);
    }  
  }

  // Creator and created/modified timestamp metadata
  const creationMeta = body => {
    const meta = {};

    const { user } = Environment;

    // Metadata is only added when a user is set, otherwise
    // the Editor operates in 'anonymous mode'. Also,
    // no point in adding meta while we're in draft state
    if (!body.draft && user) {
      meta.creator = {};
      if (user.id) meta.creator.id = user.id;
      if (user.displayName) meta.creator.name = user.displayName;

      if (body.created)
        body.modified = Environment.getCurrentTimeAdjusted();
      else
        body.created = Environment.getCurrentTimeAdjusted();
    }

    return meta;
  }

  const onAppendBody = body => setCurrentAnnotation(
    currentAnnotation.clone({ 
      body: [ ...currentAnnotation.bodies, { ...body, ...creationMeta(body) } ] 
    })
  );

  const onUpdateBody = (previous, updated) => setCurrentAnnotation(
    currentAnnotation.clone({
      body: currentAnnotation.bodies.map(body => 
        body === previous ? { ...updated, ...creationMeta(updated) } : body)
    })
  );

  const onRemoveBody = body => setCurrentAnnotation(

   
    currentAnnotation.clone({
      
      body: currentAnnotation.bodies.filter(b => b !== body)
    })
  );

  const onOk = _ => {

    console.log('on OK');
    // Removes the 'draft' flag from all bodies
    const undraft = annotation => annotation.clone({
      body : annotation.bodies.map(({ draft, ...rest }) =>
        draft ? { ...rest, ...creationMeta(rest) } : rest )
    });



    //props.selectedElement.lastChild.setAttribute('y', y + 15);
    // Current annotation is either a selection (if it was created from 
    // scratch just now) or an annotation (if it existed already and was
    // opened for editing)
    if (currentAnnotation.bodies.length === 0) {
      if (currentAnnotation.isSelection)
        props.onCancel();
      else 
        props.onAnnotationDeleted(props.annotation);
    } else {
      if (currentAnnotation.isSelection){
        
        props.onAnnotationCreated(undraft(currentAnnotation).toAnnotation());
      }
       
      else{
        props.onAnnotationUpdated(undraft(currentAnnotation), props.annotation);
      }
        
    }
    /*
    const shit = document.createElement('div');
    shit.id = 'XXX';
    shit.style.width = '20px';
    shit.style.height = '20px';
    shit.style.backgroundColor = "yellow";
    const textElement =  document.createElementNS(SVG_NAMESPACE, 'text');
    textElement.textContent = 'Hallelujha!';
    props.selectedElement.insertAdjacentElement('afterend', textElement);
    props.selectedElement.insertAdjacentElement('afterbegin', shit);*/
    //console.log(props.selectedElement);
  };


  

  return (
    <div ref={element} className="r6o-editor">
      <div className="arrow" />
      <div className="inner" style="display: inline-block">
        {React.Children.map(props.children, child =>
          React.cloneElement(child, { 
            ...child.props,
            annotation : currentAnnotation,
            readOnly : props.readOnly,
            
            onAppendBody : onAppendBody,
            onUpdateBody : onUpdateBody,
            onRemoveBody : onRemoveBody,
            onSaveAndClose : onOk              
          }))
        }
        
        { props.readOnly ? (
          <div className="footer">
            <button
              className="r6o-btn" 
              onClick={props.onCancel}>{i18n.t('Close')}</button>
          </div>
        ) : (
          <div className="footer">
            <button 
              className="r6o-btn outline btn btn-cancel"
              onClick={props.onCancel}>{i18n.t('Cancel')}</button>

            <button 
              className="r6o-btn btn btn-primary"
              onClick={onOk}>{i18n.t('Ok')}</button>
          </div>
        )}
      </div>
    </div>
  )

}

export default Editor;