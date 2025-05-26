'use client';

import { withProps } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import {
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    SubscriptPlugin,
    SuperscriptPlugin,
    UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CalloutPlugin } from '@udecode/plate-callout/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@udecode/plate-code-block/react';

import { CommentsPlugin } from '@udecode/plate-comments/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import { SlashInputPlugin } from '@udecode/plate-slash-command/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { ParagraphPlugin, PlateLeaf } from '@udecode/plate/react';

import { CommentLeaf } from '@/registry/default/potion-ui/comment-leaf';
import { AILeaf } from '@/registry/default/potion-ui/ai-leaf';
import { BlockquoteElement } from '@/registry/default/potion-ui/blockquote-element';
import { CalloutElement } from '@/registry/default/potion-ui/callout-element';
import { CodeBlockElement } from '@/registry/default/potion-ui/code-block-element';
import { CodeLeaf } from '@/registry/default/potion-ui/code-leaf';
import { CodeLineElement } from '@/registry/default/potion-ui/code-line-element';
import { CodeSyntaxLeaf } from '@/registry/default/potion-ui/code-syntax-leaf';
import { ColumnElement } from '@/registry/default/potion-ui/column-element';
import { ColumnGroupElement } from '@/registry/default/potion-ui/column-group-element';
import { DateElement } from '@/registry/default/potion-ui/date-element';
import { EmojiInputElement } from '@/registry/default/potion-ui/emoji-input-element';
import { EquationElement } from '@/registry/default/potion-ui/equation-element';
import { HeadingElement } from '@/registry/default/potion-ui/heading-element';
import { HighlightLeaf } from '@/registry/default/potion-ui/highlight-leaf';
import { HrElement } from '@/registry/default/potion-ui/hr-element';
import { ImageElement } from '@/registry/default/potion-ui/image-element';
import { InlineEquationElement } from '@/registry/default/potion-ui/inline-equation-element';
import { KbdLeaf } from '@/registry/default/potion-ui/kbd-leaf';
import { LinkElement } from '@/registry/default/potion-ui/link-element';
import { MediaAudioElement } from '@/registry/default/potion-ui/media-audio-element';
import { MediaEmbedElement } from '@/registry/default/potion-ui/media-embed-element';
import { MediaFileElement } from '@/registry/default/potion-ui/media-file-element';
import { MediaPlaceholderElement } from '@/registry/default/potion-ui/media-placeholder-element';
import { MediaVideoElement } from '@/registry/default/potion-ui/media-video-element';
import { MentionElement } from '@/registry/default/potion-ui/mention-element';
import { MentionInputElement } from '@/registry/default/potion-ui/mention-input-element';
import { ParagraphElement } from '@/registry/default/potion-ui/paragraph-element';
import { SlashInputElement } from '@/registry/default/potion-ui/slash-input-element';
import { SuggestionLeaf } from '@/registry/default/potion-ui/suggestion-leaf';
import {
  TableCellElement,
  TableCellHeaderElement,
} from '@/registry/default/potion-ui/table-cell-element';
import { TableElement } from '@/registry/default/potion-ui/table-element';
import { SpreadsheetElement } from '@/registry/default/potion-ui/spreadsheet-element';
import { TableRowElement } from '@/registry/default/potion-ui/table-row-element';
import { TocElement } from '@/registry/default/potion-ui/toc-element';
import { ToggleElement } from '@/registry/default/potion-ui/toggle-element';
import { SpreadsheetPlugin} from '@/registry/default/components/editor/plugins/spreadsheet-plugin';

export const basicComponents = {
  [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
  [ParagraphPlugin.key]: ParagraphElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
};
export const viewComponents = {
    ...basicComponents,

    [AudioPlugin.key]: MediaAudioElement,
    [BlockquotePlugin.key]: BlockquoteElement,
    [CalloutPlugin.key]: CalloutElement,
    [CodeBlockPlugin.key]: CodeBlockElement,
    [CodeLinePlugin.key]: CodeLineElement,
    [CodePlugin.key]: CodeLeaf,
    [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
    [ColumnItemPlugin.key]: ColumnElement,
    [ColumnPlugin.key]: ColumnGroupElement,
    [CommentsPlugin.key]: CommentLeaf,
    [DatePlugin.key]: DateElement,
    [EquationPlugin.key]: EquationElement,
    [FilePlugin.key]: MediaFileElement,
    [HEADING_KEYS.h1]: HeadingElement,
    [HighlightPlugin.key]: HighlightLeaf,
    [HorizontalRulePlugin.key]: HrElement,
    [ImagePlugin.key]: ImageElement,
    [InlineEquationPlugin.key]: InlineEquationElement,
    [KbdPlugin.key]: KbdLeaf,
    [LinkPlugin.key]: LinkElement,
    [MediaEmbedPlugin.key]: MediaEmbedElement,
    [MentionPlugin.key]: MentionElement,
    [PlaceholderPlugin.key]: MediaPlaceholderElement,
    [SubscriptPlugin.key]: withProps(PlateLeaf, { as: 'sub' }),
    [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: 'sup' }),
    [SuggestionPlugin.key]: SuggestionLeaf,
    [TableCellHeaderPlugin.key]: TableCellHeaderElement,
    [TableCellPlugin.key]: TableCellElement,
    [TablePlugin.key]: TableElement,
    [SpreadsheetPlugin.key]: SpreadsheetElement,
    [TableRowPlugin.key]: TableRowElement,
    [TocPlugin.key]: TocElement,
    [TogglePlugin.key]: ToggleElement,
    [VideoPlugin.key]: MediaVideoElement,
  };
  
  export const editorComponents = {
    ...viewComponents,
    [AIPlugin.key]: AILeaf,
    [EmojiInputPlugin.key]: EmojiInputElement,
    [MentionInputPlugin.key]: MentionInputElement,
    [PlaceholderPlugin.key]: MediaPlaceholderElement,
    [SlashInputPlugin.key]: SlashInputElement,
  };