import React from 'react';

interface AuthorCardProps {
  name: string;
  title: string;
  url: string;
  image_url: string;
}

export default function AuthorCard({ name, title, url, image_url }: AuthorCardProps) {
  return (
    <div className="avatar margin-bottom--md" style={{ alignItems: 'center' }}>
      <img
        className="avatar__photo avatar__photo--lg"
        src={image_url}
        alt={name}
        style={{ width: '60px', height: '60px', borderRadius: '50%' }}
      />
      <div className="avatar__intro" style={{ marginLeft: '1rem' }}>
        <div className="avatar__name">
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {name}
          </a>
        </div>
        <small className="avatar__subtitle" style={{ color: 'var(--ifm-color-content-secondary)' }}>
          {title}
        </small>
      </div>
    </div>
  );
}
